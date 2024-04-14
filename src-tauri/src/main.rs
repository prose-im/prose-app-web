// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/**************************************************************************
 * MODULES
 * ************************************************************************* */

mod download;
mod menu;
mod notifications;

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use tauri::plugin::Plugin;
use tauri::{Manager, Runtime, WindowEvent};
use tauri_plugin_log::{LogTarget, RotationStrategy, TimezoneStrategy};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

/**************************************************************************
 * MAIN
 * ************************************************************************* */

fn main() {
    // Prepare Prose for deep-linking
    tauri_plugin_deep_link::prepare("prose");

    // Create Prose bundle
    tauri::Builder::default()
        .menu(menu::create())
        .on_menu_event(menu::handler)
        .setup(|app| {
            let handle = app.handle();
            let window = app.get_window("main").unwrap();

            // Apply vibrancy on window (macOS only)
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None).unwrap();

            // Register URL opener on XMPP URIs
            tauri_plugin_deep_link::register("xmpp", move |request| {
                if let Some(window) = handle.get_window("main") {
                    let _ = window.set_focus();
                    let _ = window.emit("url:open", request);
                }
            })
            .unwrap();

            #[cfg(not(target_os = "macos"))]
            if let Some(url) = std::env::args().nth(1) {
                app.emit_all("url:open", url).unwrap();
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
            WindowEvent::Focused(focused) => event.window().emit("window:focus", focused).unwrap(),
            _ => {}
        })
        .plugin(download::provide())
        .plugin(notifications::provide())
        .plugin(logger_plugin())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn logger_plugin<R: Runtime>() -> impl Plugin<R> {
    let format =
        time::format_description::parse("[[[year]-[month]-[day]][[[hour]:[minute]:[second]]")
            .unwrap();

    tauri_plugin_log::Builder::default()
        .rotation_strategy(RotationStrategy::KeepAll)
        .targets([LogTarget::LogDir, LogTarget::Stdout])
        .format(move |out, message, record| {
            out.finish(format_args!(
                "{}[{}] {}",
                TimezoneStrategy::UseUtc.get_now().format(&format).unwrap(),
                record.level(),
                message
            ))
        })
        .build()
}
