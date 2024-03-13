// This file is part of prose-app-web
//
// Copyright 2023, Prose Foundation

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use directories::UserDirs;
use serde::{Deserialize, Serialize};
use tauri::{Manager, WindowEvent};
use thiserror::Error;
use tokio::fs::File;
use tokio::io::AsyncWriteExt;

#[derive(Serialize, Deserialize, Debug, Error, PartialEq, Eq)]
pub enum DownloadError {
    #[error("Packet is too small, missing Bytes")]
    CouldNotCreateFile,
    #[error("Could not download File")]
    DownloadError
}

#[tauri::command]
async fn download_file(url: &str, filename: &str) -> Result<(), DownloadError> {
    // todo path traversal not secure yet
    let filename = filename.to_string()
        .replace("/", "")
        .replace("\\", "")
        .replace(":", "")
        .replace("..", "");
    
    let user_dirs = UserDirs::new().unwrap();
    let download_dir = user_dirs.download_dir().unwrap();
    let download_path = download_dir.join(filename);
    let mut response = reqwest::get(url).await.map_err(|_| DownloadError::DownloadError)?;
    let mut file = File::create(download_path).await
        .map_err(|_| DownloadError::CouldNotCreateFile)?;

    while let Some(chunk) = response.chunk().await.map_err(|_| DownloadError::DownloadError)? {
        file.write_all(&chunk).await.map_err(|_| DownloadError::DownloadError)?;
    }
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                #[cfg(not(target_os = "macos"))] {
                    event.window().hide().unwrap();
                }

                #[cfg(target_os = "macos")] {
                    tauri::AppHandle::hide(&event.window().app_handle()).unwrap();
                }
                api.prevent_close();
            }
            WindowEvent::Focused(focused) => {
                println!("Window focused: {}", focused);
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![download_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
