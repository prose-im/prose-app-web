// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/**************************************************************************
 * MODULES
 * ************************************************************************* */

mod connection;
mod download;
mod logger;
//mod menu; -- TODO
mod notifications;

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use tauri::{Emitter, Manager, WindowEvent};
//use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial}; -- TODO

/**************************************************************************
 * MAIN
 * ************************************************************************* */

#[tokio::main]
async fn main() {
    // Important: start a Tokio reactor from there, which is needed for things \
    //   like connection management.

    // Prepare Prose for deep-linking
    tauri_plugin_deep_link::prepare("prose");

    // Create Prose bundle
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        //.menu(menu::create()) -- TODO
        //.on_menu_event(menu::handler) -- TODO
        // TODO: restore this whole setup hook!
        /*.setup(|app| {
            let handle = app.handle();
            // TODO
            //let window = app.get_webview_window("main").unwrap();
            // Apply vibrancy on window (macOS only)
            // TODO
            //#[cfg(target_os = "macos")]
            //apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None).unwrap();
            // Register URL opener on XMPP URIs
            tauri_plugin_deep_link::register("xmpp", move |request| {
                if let Some(window) = handle.get_webview_window("main") {
                    let _ = window.set_focus();
                    let _ = window.emit("url:open", request);
                }
            })
            .unwrap();
            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(1) {
                app.emit("url:open", url).unwrap();
            }
            Ok(())
        }) */
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                #[cfg(not(target_os = "macos"))]
                {
                    window.hide().unwrap();
                }

                #[cfg(target_os = "macos")]
                {
                    tauri::AppHandle::hide(&window.app_handle()).unwrap();
                }

                api.prevent_close();
            }
            WindowEvent::Focused(focused) => window.emit("window:focus", focused).unwrap(),
            _ => {}
        })
        .plugin(connection::provide())
        .plugin(download::provide())
        .plugin(notifications::provide())
        .plugin(logger::provide())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
