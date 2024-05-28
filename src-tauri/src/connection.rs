// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use futures::stream::StreamExt;
use jid::FullJid;
use serde::Serialize;
use std::sync::RwLock;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Manager, Runtime, State, Window};
use tokio_xmpp::connect::ServerConnector;
use tokio_xmpp::starttls::ServerConfig;
use tokio_xmpp::{AsyncClient as Client, Error, Event};

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
struct ConnectionState {
    client: RwLock<Option<Client<ServerConfig>>>,
}

/**************************************************************************
 * HELPERS
 * ************************************************************************* */

// TODO
// async fn handle_event(client: Client, event: Event) -> Result<(), ()> {
//     // TODO
//     println!("got xmpp event = {:?}", event);

//     Ok(())
// }

async fn poll_events<R: Runtime, C: ServerConnector>(
    window: Window<R>,
    mut client: Client<C>,
) -> Result<(), ()> {
    while let Some(event) = client.next().await {
        match event {
            Event::Disconnected(Error::Disconnected) => {
                // TODO
                print!("event : disconnected(disconnected).\n");

                window
                    .emit(EVENT_STATE, EventConnectionState::Disconnected)
                    .unwrap();

                // Abort here (success)
                return Ok(());
            }
            Event::Disconnected(Error::Auth(_)) => {
                // TODO
                print!("event : disconnected(auth).\n");

                window
                    .emit(EVENT_STATE, EventConnectionState::AuthenticationFailure)
                    .unwrap();

                // Abort here (error)
                return Err(());
            }
            Event::Disconnected(e) => {
                // TODO
                println!("event : disconnected(other). --> {:?}\n", e);

                window
                    .emit(EVENT_STATE, EventConnectionState::ConnectionError)
                    .unwrap();

                // Abort here (error)
                return Err(());
            }
            Event::Online { .. } => {
                // TODO
                print!("event : online.\n");

                window
                    .emit(EVENT_STATE, EventConnectionState::Connected)
                    .unwrap();

                // Continue
                continue;
            }
            Event::Stanza(stanza) => {
                // TODO
                print!("event : stanza ==> {:?}\n", stanza);

                window.emit(EVENT_RECEIVE, format!("{:?}", stanza)).unwrap();

                // Continue
                continue;
            }
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
    mut state: State<'_, ConnectionState>,
    jid: &str,
    password: &str,
) -> Result<(), ()> {
    // TODO
    print!("connection.connect() requested...\n");

    // Assert that no other client is managed by state
    // TODO

    // Parse JID
    // TODO: do not mute errors?
    let jid = FullJid::new(jid).or(Err(()))?;

    // Create new client
    let mut client = Client::new(jid, password);

    // Connections are single-use only
    client.set_reconnect(false);

    // Store client in state
    // TODO: figure out how to share between state and poll loop
    // {
    //     let mut state_client = state.client.write().unwrap();

    //     *state_client = Some(client);
    // }

    // Poll for events
    poll_events(window, client).await
}

#[tauri::command]
pub fn disconnect() {
    // TODO
    print!("connection.disconnect() requested...\n");

    // TODO: client.send_end()
}

#[tauri::command]
pub fn send() {
    // TODO
    print!("connection.send() requested...\n");

    // TODO: client.send_stanza()
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
