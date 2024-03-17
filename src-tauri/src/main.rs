// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod download;
mod notifications;

use tauri::{Manager, WindowEvent};

fn main() {
    // if there are problems with deep linking, check this
    tauri_plugin_deep_link::prepare("prose");
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            tauri_plugin_deep_link::register("xmpp", move |request| {
                if let Some(window) = handle.get_window("main") {
                    // rather fail silently than crash the app
                    let _ = window.set_focus();
                    let _ = window.emit("scheme-request-received", request);
                }
            }).unwrap();
            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(1) {
                app.emit_all("scheme-request-received", url).unwrap();
            }

            Ok(())
        })
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                #[cfg(not(target_os = "macos"))]
                {
                    event.window().hide().unwrap();
                }

                #[cfg(target_os = "macos")]
                {
                    tauri::AppHandle::hide(&event.window().app_handle()).unwrap();
                }

                api.prevent_close();
            }
            WindowEvent::Focused(focus) => {
                event.window().emit("window-focused", focus).unwrap()
            }
            _ => {}
        })
        .plugin(download::init())
        .plugin(notifications::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
