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
use std::collections::HashMap;
use std::sync::RwLock;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State, Window};
use thiserror::Error;
use tokio::sync::mpsc::{self, UnboundedReceiver, UnboundedSender};
use tokio::task::{self, JoinHandle};
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
    #[error("Invalid JID, cannot connect")]
    InvalidJid,
    #[error("Connection identifier already exists")]
    ConnectionAlreadyExists,
}

#[derive(Serialize, Debug, Error)]
pub enum SendError {
    #[error("Failure to write on sender")]
    CannotWrite,
    #[error("Failure to parse stanza to send")]
    CannotParse,
    #[error("Connection does not exist")]
    ConnectionDoesNotExist,
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

struct ConnectionClient {
    sender: UnboundedSender<Packet>,
    read_handle: JoinHandle<()>,
    write_handle: JoinHandle<()>,
}

#[derive(Default)]
pub struct ConnectionClientState {
    connections: RwLock<HashMap<String, ConnectionClient>>,
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

fn emit_connection_abort<R: Runtime>(window: &Window<R>, id: &str, state: ConnectionState) {
    // Emit connection abort state
    window
        .emit(EVENT_STATE, EventConnectionState { id, state })
        .unwrap();

    // Also emit a disconnected event
    // Notice: this informs the client that the connection is effectively \
    //   disconnected, whether we encountered an error or not. Do not \
    //   re-emit the disconnected state twice if current state already \
    //   was 'disconnected'.
    if state != ConnectionState::Disconnected {
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
    while let Some(event) = client_reader.next().await {
        match event {
            Event::Disconnected(Error::Disconnected) => {
                emit_connection_abort(window, id, ConnectionState::Disconnected);

                // Abort here (success)
                return Ok(());
            }
            Event::Disconnected(Error::Auth(err)) => {
                warn!(
                    "Received disconnected event on: #{}, with authentication error: {}",
                    id, err
                );

                emit_connection_abort(window, id, ConnectionState::AuthenticationFailure);

                // Abort here (error)
                return Err(PollInputError::AuthenticationError);
            }
            Event::Disconnected(Error::Connection(err)) => {
                warn!(
                    "Received disconnected event: #{}, with connection error: {}",
                    id, err
                );

                // Notice: consider as timeout here.
                emit_connection_abort(window, id, ConnectionState::ConnectionTimeout);

                // Abort here (error)
                return Err(PollInputError::ConnectionError);
            }
            Event::Disconnected(err) => {
                warn!("Received disconnected event: #{}, with error: {}", id, err);

                emit_connection_abort(window, id, ConnectionState::ConnectionError);

                // Abort here (error)
                return Err(PollInputError::OtherError);
            }
            Event::Online { .. } => {
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
pub fn connect<R: Runtime>(
    window: Window<R>,
    state: State<'_, ConnectionClientState>,
    id: &str,
    jid: &str,
    password: &str,
) -> Result<(), ConnectError> {
    info!("Connection #{} connect requested on JID: {}", id, jid);

    // Assert that connection identifier does not already exist
    if state.connections.read().unwrap().contains_key(id) {
        return Err(ConnectError::ConnectionAlreadyExists);
    }

    // Parse JID
    let jid = FullJid::new(jid).or(Err(ConnectError::InvalidJid))?;

    // Create new client
    let mut client = Client::new(jid, password);

    // Connections are single-use only
    client.set_reconnect(false);

    // Split client into RX (for writer) and TX (for reader)
    let (tx, rx) = mpsc::unbounded_channel();
    let (writer, reader) = client.split();

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

    let read_handle = {
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
        })
    };

    // Add new connection in state
    {
        let mut state_connections = state.connections.write().unwrap();

        state_connections.insert(
            id.to_string(),
            ConnectionClient {
                sender: tx,
                read_handle,
                write_handle,
            },
        );

        info!(
            "There are now {} connections in the global state: {}",
            state_connections.len(),
            state_connections
                .keys()
                .map(|id| format!("#{}", id))
                .collect::<Vec<_>>()
                .join(", ")
        );
    }

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
    let end_result = if let Some(ref connection) = state.connections.read().unwrap().get(id) {
        connection
            .sender
            .send(Packet::StreamEnd)
            .or(Err(DisconnectError::CannotWrite))
    } else {
        Err(DisconnectError::ConnectionDoesNotExist)
    };

    // Abort early if failure
    end_result?;

    debug!("Connection #{} disconnect request complete", id);

    Ok(())
}

#[tauri::command]
pub fn destroy(id: &str, state: State<'_, ConnectionClientState>) -> Result<(), ()> {
    info!("Connection #{} destroy requested", id);

    // Remove existing connection?
    // Important: this does not disconnect the XMPP stream! Please make sure to call \
    //   the destroy command whenever the frontend is certain that the connection \
    //   has been disconnected, that is, following an explicit or implicit \
    //   disconnection connection state event. The destroy command is solely \
    //   used for garbage collection purposes (ie. stopping background tasks).
    if let Some(connection) = state.connections.write().unwrap().remove(id) {
        // Abort both task handles
        connection.write_handle.abort();
        connection.read_handle.abort();

        // Drop connection sender
        drop(connection.sender);

        debug!("Connection #{} destroy request complete", id);
    } else {
        warn!(
            "Connection #{} destroy request complete, but was already destroyed",
            id
        );
    }

    Ok(())
}

#[tauri::command]
pub fn send(
    id: &str,
    state: State<'_, ConnectionClientState>,
    stanza: String,
) -> Result<(), SendError> {
    debug!("Connection #{} send requested (will send XMPP stanza)", id);

    if let Some(ref connection) = state.connections.read().unwrap().get(id) {
        let stanza_root = stanza.parse().or(Err(SendError::CannotParse))?;

        connection
            .sender
            .send(Packet::Stanza(stanza_root))
            .or(Err(SendError::CannotWrite))
    } else {
        Err(SendError::ConnectionDoesNotExist)
    }
}

/**************************************************************************
 * PROVIDERS
 * ************************************************************************* */

pub fn provide<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("connection")
        .invoke_handler(tauri::generate_handler![connect, disconnect, destroy, send])
        .setup(|app_handle| {
            app_handle.manage(ConnectionClientState::default());

            Ok(())
        })
        .build()
}
