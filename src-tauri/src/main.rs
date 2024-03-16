// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use directories::UserDirs;
use serde::{Deserialize, Serialize};
use tauri::{Manager, WindowEvent};
use thiserror::Error;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

#[derive(Serialize, Deserialize, Debug, Error, PartialEq, Eq)]
pub enum DownloadError {
    #[error("Could not obtain download directory")]
    CouldNotObtainDirectory,
    #[error("Packet is too small, missing bytes")]
    CouldNotCreateFile,
    #[error("Could not download file")]
    DownloadError,
}

/**************************************************************************
 * COMMANDS
 * ************************************************************************* */

#[tauri::command]
async fn download_file(url: &str, filename: &str) -> Result<(), DownloadError> {
    // TODO: path traversal not secure yet
    let filename = filename
        .to_string()
        .replace(['/', '\\', ':'], "")
        .replace("..", "");

    // Acquire directories
    let user_dirs = UserDirs::new().ok_or(DownloadError::CouldNotObtainDirectory)?;
    let download_dir = user_dirs
        .download_dir()
        .ok_or(DownloadError::CouldNotObtainDirectory)?;

    // Generate download path
    let download_path = download_dir.join(filename);

    // Download file
    let mut response = reqwest::get(url)
        .await
        .map_err(|_| DownloadError::DownloadError)?;

    // Create file on filesystem
    let mut file = File::create(download_path)
        .await
        .map_err(|_| DownloadError::CouldNotCreateFile)?;

    // Drain bytes from HTTP response to file
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| DownloadError::DownloadError)?
    {
        file.write_all(&chunk)
            .await
            .map_err(|_| DownloadError::DownloadError)?;
    }

    Ok(())
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn set_badge_count(count: u32) {
    // Reference: https://github.com/tauri-apps/tauri/issues/4489
    use cocoa::{appkit::NSApp, foundation::NSString};
    use objc::{msg_send, sel, sel_impl};

    unsafe {
        let label = if count == 0 {
            cocoa::base::nil
        } else {
            NSString::alloc(cocoa::base::nil).init_str(&format!("{}", count))
        };

        let dock_tile: cocoa::base::id = msg_send![NSApp(), dockTile];
        let _: cocoa::base::id = msg_send![dock_tile, setBadgeLabel: label];
    }
}

#[tauri::command]
#[cfg(not(target_os = "macos"))]
fn set_badge_count(count: u32) {
    println!("set_badge_count is not implemented for this platform");
}

/**************************************************************************
 * MAIN
 * ************************************************************************* */

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
        .invoke_handler(tauri::generate_handler![download_file, set_badge_count])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
