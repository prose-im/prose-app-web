// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use futures::stream::{SplitSink, SplitStream, StreamExt};
use futures::SinkExt;
use jid::FullJid;
use log::{debug, error, info, warn};
use serde::Serialize;
use std::sync::{Arc, RwLock};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State, Window};
use thiserror::Error;
use tokio::sync::mpsc::{self, UnboundedReceiver, UnboundedSender};
use tokio::task;
use tokio_xmpp::connect::ServerConnector;
use tokio_xmpp::{AsyncClient as Client, Error, Event, Packet};

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const EVENT_STATE: &'static str = "connection:state";
const EVENT_RECEIVE: &'static str = "connection:receive";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type DisconnectError = SendError;

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

#[derive(Serialize, Clone, Copy, Eq, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum EventConnectionState {
    Connected,
    Disconnected,
    AuthenticationFailure,
    ConnectionError,
    ConnectionTimeout,
}

#[derive(Serialize, Debug, Error)]
pub enum ConnectError {
    #[error("Failure to close other sender running")]
    CannotCloseOtherSender,
    #[error("Invalid JID, cannot connect")]
    InvalidJid,
}

#[derive(Serialize, Debug, Error)]
pub enum SendError {
    #[error("Failure to write on sender")]
    CannotWrite,
    #[error("Failure to parse stanza to send")]
    CannotParse,
    #[error("Connection has no sender set")]
    SenderDoesNotExist,
}

#[derive(Serialize, Debug, Error)]
pub enum PollInputError {
    #[error("Authentication error")]
    AuthenticationError,
    #[error("Connection error")]
    ConnectionError,
    #[error("Other error")]
    OtherError,
}

#[derive(Serialize, Debug, Error)]
pub enum PollOutputError {
    #[error("Packet send error")]
    PacketSendError,
}

/**************************************************************************
 * STRUCTURES
 * ************************************************************************* */

#[derive(Default)]
pub struct ConnectionState {
    sender: RwLock<Option<Arc<UnboundedSender<Packet>>>>,
}

/**************************************************************************
 * HELPERS
 * ************************************************************************* */

fn emit_connection_abort<R: Runtime>(
    window: &Window<R>,
    state: EventConnectionState,
    connected: bool,
) {
    // Emit connection abort state
    window.emit(EVENT_STATE, state).unwrap();

    // Were we connected? Then also emit a disconnected event
    // Notice: this informs the client that the connection is effectively \
    //   disconnected, whether we encountered an error or not. Do not \
    //   re-emit the disconnected state twice if current state already \
    //   was 'disconnected'.
    if connected && state != EventConnectionState::Disconnected {
        window
            .emit(EVENT_STATE, EventConnectionState::Disconnected)
            .unwrap();
    }
}

async fn poll_input_events<R: Runtime, C: ServerConnector>(
    window: &Window<R>,
    mut client_reader: SplitStream<Client<C>>,
) -> Result<(), PollInputError> {
    let mut connected = false;

    while let Some(event) = client_reader.next().await {
        match event {
            Event::Disconnected(Error::Disconnected) => {
                emit_connection_abort(window, EventConnectionState::Disconnected, connected);

                // Abort here (success)
                return Ok(());
            }
            Event::Disconnected(Error::Auth(err)) => {
                warn!(
                    "Received disconnected event, with authentication error: {}",
                    err
                );

                emit_connection_abort(
                    window,
                    EventConnectionState::AuthenticationFailure,
                    connected,
                );

                // Abort here (error)
                return Err(PollInputError::AuthenticationError);
            }
            Event::Disconnected(Error::Connection(err)) => {
                warn!(
                    "Received disconnected event, with connection error: {}",
                    err
                );

                // Notice: consider as timeout here.
                emit_connection_abort(window, EventConnectionState::ConnectionTimeout, connected);

                // Abort here (error)
                return Err(PollInputError::ConnectionError);
            }
            Event::Disconnected(err) => {
                warn!("Received disconnected event, with error: {}", err);

                emit_connection_abort(window, EventConnectionState::ConnectionError, connected);

                // Abort here (error)
                return Err(PollInputError::OtherError);
            }
            Event::Online { .. } => {
                connected = true;

                window
                    .emit(EVENT_STATE, EventConnectionState::Connected)
                    .unwrap();

                // Continue
                continue;
            }
            Event::Stanza(stanza) => {
                window.emit(EVENT_RECEIVE, String::from(&stanza)).unwrap();

                // Continue
                continue;
            }
        }
    }

    Ok(())
}

async fn poll_output_events<C: ServerConnector>(
    mut client_writer: SplitSink<Client<C>, Packet>,
    mut rx: UnboundedReceiver<Packet>,
) -> Result<(), PollOutputError> {
    while let Some(packet) = rx.recv().await {
        if let Err(err) = client_writer.send(packet).await {
            error!("Failed sending packet over connection: {}", err);

            return Err(PollOutputError::PacketSendError);
        }
    }

    Ok(())
}

/**************************************************************************
 * COMMANDS
 * ************************************************************************* */

#[tauri::command]
pub async fn connect<R: Runtime>(
    window: Window<R>,
    state: State<'_, ConnectionState>,
    jid: &str,
    password: &str,
) -> Result<(), ConnectError> {
    info!("Connection connect requested on JID: {}", jid);

    // Parse JID
    let jid = FullJid::new(jid).or(Err(ConnectError::InvalidJid))?;

    // Another sender running? (this should never happen)
    if let Some(ref sender) = *state.sender.read().unwrap() {
        if !sender.is_closed() {
            warn!("Connection already has an unclosed sender running, forcibly ending it!");

            sender
                .send(Packet::StreamEnd)
                .or(Err(ConnectError::CannotCloseOtherSender))?;
        }
    }

    // Create new client
    let mut client = Client::new(jid, password);

    // Connections are single-use only
    client.set_reconnect(false);

    // Split client into RX (for writer) and TX (for reader)
    let (tx, rx) = mpsc::unbounded_channel();
    let (writer, reader) = client.split();

    // Make sender
    let sender = Arc::new(tx);

    // Store new sender in state
    *state.sender.write().unwrap() = Some(sender.clone());

    // Spawn all tasks
    let write_handle = {
        task::spawn(async move {
            // Poll for output events
            if let Err(err) = poll_output_events(writer, rx).await {
                warn!("Connection write poller terminated with error: {}", err);
            } else {
                debug!("Connection write poller was stopped");
            }
        })
    };

    let _read_handle = {
        task::spawn(async move {
            // Poll for input events
            if let Err(err) = poll_input_events(&window, reader).await {
                warn!("Connection read poller terminated with error: {}", err);
            } else {
                debug!("Connection read poller was stopped");
            }

            // Abort other handles
            write_handle.abort();
        })
    };

    debug!("Connection connect request complete");

    Ok(())
}

#[tauri::command]
pub fn disconnect(state: State<'_, ConnectionState>) -> Result<(), DisconnectError> {
    info!("Connection disconnect requested");

    // Send stream end?
    let end_result = if let Some(ref sender) = *state.sender.read().unwrap() {
        sender
            .send(Packet::StreamEnd)
            .or(Err(DisconnectError::CannotWrite))
    } else {
        Err(DisconnectError::SenderDoesNotExist)
    };

    // Abort early if failure
    end_result?;

    // Un-assign sender
    *state.sender.write().unwrap() = None;

    debug!("Connection disconnect request complete");

    Ok(())
}

#[tauri::command]
pub fn send(state: State<'_, ConnectionState>, stanza: String) -> Result<(), SendError> {
    if let Some(ref sender) = *state.sender.read().unwrap() {
        let stanza_root = stanza.parse().or(Err(SendError::CannotParse))?;

        sender
            .send(Packet::Stanza(stanza_root))
            .or(Err(SendError::CannotWrite))
    } else {
        Err(SendError::SenderDoesNotExist)
    }
}

/**************************************************************************
 * PROVIDERS
 * ************************************************************************* */

pub fn provide<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("connection")
        .invoke_handler(tauri::generate_handler![connect, disconnect, send])
        .setup(|app_handle| {
            app_handle.manage(ConnectionState::default());

            Ok(())
        })
        .build()
}
