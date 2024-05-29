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

#[derive(Serialize, Debug, Clone, Copy, Eq, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum ConnectionState {
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
    #[error("Connection sender is closed")]
    SenderClosed,
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
pub struct ConnectionClientState {
    sender: RwLock<Option<Arc<UnboundedSender<Packet>>>>,
}

#[derive(Debug, Clone, Serialize)]
struct EventConnectionState<'a> {
    id: &'a str,
    state: ConnectionState,
}

#[derive(Debug, Clone, Serialize)]
struct EventConnectionReceive<'a> {
    id: &'a str,
    stanza: &'a str,
}

/**************************************************************************
 * HELPERS
 * ************************************************************************* */

fn emit_connection_abort<R: Runtime>(
    window: &Window<R>,
    id: &str,
    state: ConnectionState,
    connected: bool,
) {
    // Emit connection abort state
    window
        .emit(EVENT_STATE, EventConnectionState { id, state })
        .unwrap();

    // Were we connected? Then also emit a disconnected event
    // Notice: this informs the client that the connection is effectively \
    //   disconnected, whether we encountered an error or not. Do not \
    //   re-emit the disconnected state twice if current state already \
    //   was 'disconnected'.
    if connected && state != ConnectionState::Disconnected {
        window
            .emit(
                EVENT_STATE,
                EventConnectionState {
                    id,
                    state: ConnectionState::Disconnected,
                },
            )
            .unwrap();
    }
}

async fn poll_input_events<R: Runtime, C: ServerConnector>(
    window: &Window<R>,
    id: &str,
    mut client_reader: SplitStream<Client<C>>,
) -> Result<(), PollInputError> {
    let mut connected = false;

    while let Some(event) = client_reader.next().await {
        match event {
            Event::Disconnected(Error::Disconnected) => {
                emit_connection_abort(window, id, ConnectionState::Disconnected, connected);

                // Abort here (success)
                return Ok(());
            }
            Event::Disconnected(Error::Auth(err)) => {
                warn!(
                    "Received disconnected event on: #{}, with authentication error: {}",
                    id, err
                );

                emit_connection_abort(
                    window,
                    id,
                    ConnectionState::AuthenticationFailure,
                    connected,
                );

                // Abort here (error)
                return Err(PollInputError::AuthenticationError);
            }
            Event::Disconnected(Error::Connection(err)) => {
                warn!(
                    "Received disconnected event: #{}, with connection error: {}",
                    id, err
                );

                // Notice: consider as timeout here.
                emit_connection_abort(window, id, ConnectionState::ConnectionTimeout, connected);

                // Abort here (error)
                return Err(PollInputError::ConnectionError);
            }
            Event::Disconnected(err) => {
                warn!("Received disconnected event: #{}, with error: {}", id, err);

                emit_connection_abort(window, id, ConnectionState::ConnectionError, connected);

                // Abort here (error)
                return Err(PollInputError::OtherError);
            }
            Event::Online { .. } => {
                connected = true;

                window
                    .emit(
                        EVENT_STATE,
                        EventConnectionState {
                            id,
                            state: ConnectionState::Connected,
                        },
                    )
                    .unwrap();

                // Continue
                continue;
            }
            Event::Stanza(stanza) => {
                let stanza_xml = String::from(&stanza);

                window
                    .emit(
                        EVENT_RECEIVE,
                        EventConnectionReceive {
                            id,
                            stanza: &stanza_xml,
                        },
                    )
                    .unwrap();

                // Continue
                continue;
            }
        }
    }

    Ok(())
}

async fn poll_output_events<C: ServerConnector>(
    id: &str,
    mut client_writer: SplitSink<Client<C>, Packet>,
    mut rx: UnboundedReceiver<Packet>,
) -> Result<(), PollOutputError> {
    while let Some(packet) = rx.recv().await {
        if let Err(err) = client_writer.send(packet).await {
            error!(
                "Failed sending packet over connection: #{} because: {}",
                id, err
            );

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
    state: State<'_, ConnectionClientState>,
    id: &str,
    jid: &str,
    password: &str,
) -> Result<(), ConnectError> {
    info!("Connection #{} connect requested on JID: {}", id, jid);

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

    // Spawn all tasks
    let write_handle = {
        let id = id.to_owned();

        task::spawn(async move {
            // Poll for output events
            if let Err(err) = poll_output_events(&id, writer, rx).await {
                warn!(
                    "Connection #{} write poller terminated with error: {}",
                    id, err
                );
            } else {
                debug!("Connection #{} write poller was stopped", id);
            }
        })
    };

    let _read_handle = {
        let id = id.to_owned();

        task::spawn(async move {
            // Poll for input events
            if let Err(err) = poll_input_events(&window, &id, reader).await {
                warn!(
                    "Connection #{} read poller terminated with error: {}",
                    id, err
                );
            } else {
                debug!("Connection #{} read poller was stopped", id);
            }

            // Abort other handles
            write_handle.abort();
        })
    };

    // Store new sender in state
    *state.sender.write().unwrap() = Some(sender.clone());

    debug!("Connection #{} connect request complete", id);

    Ok(())
}

#[tauri::command]
pub fn disconnect(
    id: &str,
    state: State<'_, ConnectionClientState>,
) -> Result<(), DisconnectError> {
    info!("Connection #{} disconnect requested", id);

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

    debug!("Connection #{} disconnect request complete", id);

    Ok(())
}

#[tauri::command]
pub fn send(
    id: &str,
    state: State<'_, ConnectionClientState>,
    stanza: String,
) -> Result<(), SendError> {
    debug!("Connection #{} send requested (will send XMPP stanza)", id);

    if let Some(ref sender) = *state.sender.read().unwrap() {
        if sender.is_closed() {
            Err(SendError::SenderClosed)
        } else {
            let stanza_root = stanza.parse().or(Err(SendError::CannotParse))?;

            sender
                .send(Packet::Stanza(stanza_root))
                .or(Err(SendError::CannotWrite))
        }
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
            app_handle.manage(ConnectionClientState::default());

            Ok(())
        })
        .build()
}
