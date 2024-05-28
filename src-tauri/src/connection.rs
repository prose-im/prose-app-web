// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use futures::stream::{SplitSink, SplitStream, StreamExt};
use futures::SinkExt;
use jid::FullJid;
use serde::Serialize;
use std::sync::{Arc, RwLock};
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State, Window};
use tokio::sync::mpsc::{self, UnboundedReceiver, UnboundedSender};
use tokio::{task, time};
use tokio_xmpp::connect::ServerConnector;
use tokio_xmpp::starttls::ServerConfig;
use tokio_xmpp::{AsyncClient as Client, Error, Event, Packet};

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const EVENT_STATE: &'static str = "connection:state";
const EVENT_RECEIVE: &'static str = "connection:receive";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

#[derive(Serialize, Clone)]
#[serde(rename_all = "kebab-case")]
pub enum EventConnectionState {
    Connected,
    Disconnected,
    AuthenticationFailure,
    ConnectionError,
}

/**************************************************************************
 * STRUCTURES
 * ************************************************************************* */

#[derive(Default)]
pub struct ConnectionState {
    sender: Arc<RwLock<Option<UnboundedSender<Packet>>>>,
}

/**************************************************************************
 * HELPERS
 * ************************************************************************* */

async fn poll_input_events<R: Runtime, C: ServerConnector>(
    window: &Window<R>,
    mut client_reader: SplitStream<Client<C>>,
) -> Result<(), ()> {
    while let Some(event) = client_reader.next().await {
        match event {
            Event::Disconnected(Error::Disconnected) => {
                window
                    .emit(EVENT_STATE, EventConnectionState::Disconnected)
                    .unwrap();

                // Abort here (success)
                return Ok(());
            }
            Event::Disconnected(Error::Auth(_)) => {
                window
                    .emit(EVENT_STATE, EventConnectionState::AuthenticationFailure)
                    .unwrap();

                // Abort here (error)
                return Err(());
            }
            Event::Disconnected(e) => {
                window
                    .emit(EVENT_STATE, EventConnectionState::ConnectionError)
                    .unwrap();

                // Abort here (error)
                return Err(());
            }
            Event::Online { .. } => {
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
) -> Result<(), ()> {
    while let Some(packet) = rx.recv().await {
        if let Err(err) = client_writer.send(packet).await {
            // TODO: log error
            println!("failed sending packet: {}", err);

            return Err(());
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
) -> Result<(), ()> {
    // TODO: raise proper errors (from enum)

    // TODO
    print!("connection.connect() requested...\n");

    // Assert that no other client is managed by state
    let has_existing_sender = { state.sender.read().unwrap().is_some() };

    if has_existing_sender {
        // TODO
        print!("connection.connect() already have a sender set, aborting.\n");

        return Err(());
    }

    // Parse JID
    // TODO: do not mute errors?
    let jid = FullJid::new(jid).or(Err(()))?;

    // Create new client
    let mut client = Client::new(jid, password);

    // Connections are single-use only
    client.set_reconnect(false);

    // Split client into RX (for writer) and TX (for reader)
    let (tx, rx) = mpsc::unbounded_channel();
    let (writer, reader) = client.split();

    // Store TX in state (as sender)
    {
        *state.sender.write().unwrap() = Some(tx);
    }

    // Spawn all tasks
    let _read_handle = {
        task::spawn(async move {
            // Poll for input events
            poll_input_events(&window, reader).await

            // TODO: clear tx from state when done here
        })
    };

    let _write_handle = task::spawn(async move {
        // Poll for output events
        poll_output_events(writer, rx).await
    });

    // TODO: add timeout handle
    // TODO: add ping handle

    Ok(())
}

#[tauri::command]
pub fn disconnect(state: State<'_, ConnectionState>) -> Result<(), ()> {
    // TODO: raise proper errors (from enum)

    // TODO
    print!("connection.disconnect() requested...\n");

    let state_sender = state.sender.read().unwrap();

    if let Some(ref client_writer) = *state_sender {
        client_writer.send(Packet::StreamEnd).or(Err(()))
    } else {
        // TODO: log error here

        Err(())
    }
}

#[tauri::command]
pub fn send(state: State<'_, ConnectionState>, stanza: String) -> Result<(), ()> {
    // TODO: raise proper errors (from enum)

    // TODO
    print!("connection.send() requested...\n");

    let state_sender = state.sender.read().unwrap();

    if let Some(ref client_writer) = *state_sender {
        let stanza_root = stanza.parse().or(Err(()))?;

        client_writer.send(Packet::Stanza(stanza_root)).or(Err(()))
    } else {
        // TODO: log error here

        Err(())
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
