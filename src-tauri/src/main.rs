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
#[cfg(target_os = "macos")]
mod menu;
mod notifications;

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use tauri::{Emitter, Manager, WindowEvent};
use tauri_plugin_deep_link::DeepLinkExt;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

/**************************************************************************
 * MAIN
 * ************************************************************************* */

#[tokio::main]
async fn main() {
    // Important: start a Tokio reactor from there, which is needed for things \
    //   like connection management.

    // Important: install default TLS provider here, otherwise the Tokio \
    //   reactor will crash later on when initiating the XMPP over TLS \
    //   connection.
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("failed to install crypto provider");

    // Create Prose builder
    let mut builder = tauri::Builder::default();

    // Mount all external plugins
    builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_updater::Builder::new().build());

    // Mount all internal plugins
    builder = builder
        .plugin(connection::provide())
        .plugin(download::provide())
        .plugin(notifications::provide())
        .plugin(logger::provide());

    // Mount menu (for certain platforms only)
    #[cfg(target_os = "macos")]
    {
        builder = builder.menu(menu::create).on_menu_event(menu::handler);
    }

    // Bind events
    builder = builder.on_window_event(|window, event| match event {
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
    });

    // Setup application
    builder = builder.setup(|app| {
        let window = app.get_webview_window("main").unwrap();

        // Apply vibrancy on window (macOS only)
        #[cfg(target_os = "macos")]
        apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None).unwrap();

        // Register URL opener on XMPP URIs
        app.deep_link().register("xmpp").ok();

        app.deep_link().on_open_url(move |event| {
            window.set_focus().ok();

            if let Some(url) = event.urls().first() {
                window.emit("url:open", url).ok();
            }
        });

        // Open target URL? (passed as process argument, if any)
        #[cfg(not(target_os = "macos"))]
        if let Some(url) = std::env::args().nth(1) {
            app.emit("url:open", url).unwrap();
        }

        Ok(())
    });

    // Run application
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
