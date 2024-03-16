// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod download;
mod notifications;

use tauri::{Manager, WindowEvent};

fn main() {
    tauri::Builder::default()
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
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
        })
        .plugin(download::init())
        .plugin(notifications::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
