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
mod menu;
mod notifications;

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use tauri::tray::TrayIconEvent;
#[cfg(target_os = "macos")]
use tauri::RunEvent;
use tauri::{AppHandle, Emitter, Manager, WebviewWindow, WindowEvent};
use tauri_plugin_deep_link::DeepLinkExt;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

/**************************************************************************
 * HELPERS
 * ************************************************************************* */

fn restore_window_target(window: &WebviewWindow) {
    // Show the window? (if hidden)
    if window.is_visible().unwrap_or(false) == false {
        window.show().unwrap();
    }

    // Also un-minimize the window? (if minimized)
    if window.is_minimized().unwrap_or(false) == false {
        window.unminimize().unwrap();
    }

    // Set the focus on the window
    window.set_focus().unwrap();
}

fn restore_window(app: &AppHandle) {
    let window = app.get_webview_window("main").unwrap();

    restore_window_target(&window);
}

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
        .plugin(tauri_plugin_notification::init())
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
        builder = builder.menu(menu::create);
    }

    // Bind events
    builder = builder
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                // Leave full-screen for the window? (before it can be hidden)
                // Notice: this is needed, to avoid the screen becoming \
                //   all-black if the window is hidden whilst still in full \
                //   screen.
                if window.is_fullscreen().unwrap_or(false) == true {
                    window.set_fullscreen(false).unwrap();
                } else {
                    // Hide the window
                    window.hide().unwrap();
                }

                // Make sure the application does not close (default behavior \
                //   on close request)
                api.prevent_close();
            }
            WindowEvent::Focused(focused) => window.emit("window:focus", focused).unwrap(),
            _ => {}
        })
        .on_tray_icon_event(|app, event| match event {
            TrayIconEvent::DoubleClick { .. } => restore_window(app),
            _ => {}
        })
        .on_menu_event(menu::handler);

    // Setup application
    builder = builder.setup(|app| {
        let window = app.get_webview_window("main").unwrap();

        // Apply vibrancy on window (macOS only)
        #[cfg(target_os = "macos")]
        apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None).unwrap();

        // Register URL opener on XMPP URIs
        app.deep_link().register("xmpp").ok();

        app.deep_link().on_open_url(move |event| {
            // Open XMPP URI? (if any)
            if let Some(url) = event.urls().first() {
                // Make sure window is visible before opening XMPP URI
                restore_window_target(&window);

                window.emit("url:open", url).ok();
            }
        });

        // Open target URL? (passed as process argument, if any)
        #[cfg(not(target_os = "macos"))]
        if let Some(url) = std::env::args().nth(1) {
            app.emit("url:open", url).unwrap();
        }

        // Setup system tray menu (Windows only)
        #[cfg(target_os = "windows")]
        menu::tray(app.handle()).unwrap();

        Ok(())
    });

    // Run application
    let app = builder
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|_app, event| match event {
        #[cfg(target_os = "macos")]
        RunEvent::Reopen { .. } => restore_window(_app),
        _ => {}
    });
}
