// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use directories::UserDirs;
use percent_encoding::percent_decode;
use serde::{Deserialize, Serialize};
use std::cmp::min;
use std::time::Instant;
use tauri::plugin::{Builder, TauriPlugin};
use tauri::{Runtime, Window};
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
    #[error("Custom error")]
    CustomError(String),
}

/**************************************************************************
 * STRUCTURES
 * ************************************************************************* */

#[derive(Debug, Clone, serde::Serialize)]
struct DownloadProgress {
    id: u64,
    progress: usize,
    total: usize,
}

/**************************************************************************
 * COMMANDS
 * ************************************************************************* */

#[tauri::command]
pub async fn download_file<R: Runtime>(
    window: Window<R>,
    id: u64,
    url: &str,
    filename: &str,
) -> Result<String, DownloadError> {
    let mut filename = filename.to_string();

    // No filename provided? Then use the last part of the URL
    if filename.is_empty() || filename == "undefined" {
        let url_fragment = url.split('/').last().unwrap_or("");

        filename = percent_decode(url_fragment.as_ref())
            .decode_utf8_lossy()
            .to_string();
    }

    // Security: ensure that provided filename is not attempting to perform a \
    //   path traversal. For instance, passing a filename '../dangerous.txt' \
    //   to store files outside of the Downloads folder. Sanitize the file \
    //   name if it is deemed dangerous.
    filename = remove_path_traversal(&filename);

    // No filename? Assign fallback filename
    if filename.is_empty() {
        filename = "File".to_string();
    }

    // Acquire the download directory
    let user_dirs = UserDirs::new().ok_or(DownloadError::CouldNotObtainDirectory)?;
    let download_dir = user_dirs
        .download_dir()
        .ok_or(DownloadError::CouldNotObtainDirectory)?;

    // Generate unique filename (if it already exists, otherwise do not change)
    let mut download_path = download_dir.join(&filename);
    let (pure_filename, filename_extension) = split_filename(&filename);

    let mut i = 1;

    while download_path.exists() {
        download_path = download_dir.join(format!("{pure_filename} ({i}){filename_extension}"));

        i += 1;
    }

    // Download file
    let mut response = reqwest::get(url)
        .await
        .map_err(|_| DownloadError::DownloadError)?;

    // Create file on filesystem
    let mut file = File::create(&download_path)
        .await
        .map_err(|_| DownloadError::CouldNotCreateFile)?;

    #[cfg(target_os = "macos")]
    {
        mac_set_quarantine(&file, "Prose")
            .map_err(|e| DownloadError::CustomError(e.to_string()))?;
    }

    // Compute total download size
    let total_bytes = response.content_length().unwrap_or(0) as usize;
    let mut downloaded_bytes = 0;
    let mut last_size_report = Instant::now();

    // Drain bytes from HTTP response to file
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| DownloadError::DownloadError)?
    {
        // Write received bytes
        file.write_all(&chunk)
            .await
            .map_err(|_| DownloadError::DownloadError)?;

        // Compute download progress (de-bounced)
        downloaded_bytes = min(downloaded_bytes + chunk.len(), total_bytes);

        if last_size_report.elapsed().as_millis() > 100 || downloaded_bytes == total_bytes {
            last_size_report = Instant::now();

            window
                .emit(
                    "download:progress",
                    DownloadProgress {
                        id,
                        progress: downloaded_bytes,
                        total: total_bytes,
                    },
                )
                .unwrap();
        }
    }

    // Flush downloaded file on disk
    file.flush()
        .await
        .map_err(|_| DownloadError::DownloadError)?;

    // Bounce Dock icon for Downloads folder
    #[cfg(target_os = "macos")]
    {
        notifications::misc::make_download_bounce(download_path.to_string_lossy().as_ref());
    }

    Ok(download_path.to_string_lossy().to_string())
}

/**************************************************************************
 * HELPERS
 * ************************************************************************* */

fn split_filename(filename: &str) -> (String, String) {
    // Splits file into pure filename and extension while conserving double \
    //   file extensions (.tar.gz, .tar.bz2, .tar.xz)
    const DOUBLE_FILE_EXTENSION: [&str; 3] = [".tar.gz", ".tar.bz2", ".tar.xz"];

    for extension in DOUBLE_FILE_EXTENSION.iter() {
        if filename.ends_with(extension) {
            let pure_filename = filename.strip_suffix(extension).unwrap_or(filename);

            return (pure_filename.to_string(), extension.to_string());
        }
    }

    let extension = if filename.contains('.') {
        filename
            .split('.')
            .last()
            .map(|ext| format!(".{}", ext))
            .unwrap_or("".to_string())
    } else {
        "".to_string()
    };

    let pure_filename = filename.strip_suffix(&extension).unwrap_or(filename);

    (pure_filename.to_string(), extension)
}

fn remove_path_traversal(filename: &str) -> String {
    // TODO: path traversal not secure yet
    // TODO: can't use fs::canonicalize because it doesn't work with \
    //   non-existing files; many path traversal crates are based on \
    //   fs::canonicalize, therefore they also can't be used.
    // 1. Remove control characters
    // 2. Remove all path separators
    // 3. Remove path traversal
    filename
        .replace(|c| c < ' ', "")
        .replace(['/', '\\', ':', '~', '@', '?', '[', ']'], "")
        .replace("..", "")
}

#[cfg(target_os = "macos")]
fn mac_set_quarantine(file: &File, application: &str) -> Result<(), std::io::Error> {
    // This method sets the quarantine flag so that the user cannot just open \
    //   downloaded file if it is an application
    // @ref: https://apple.stackexchange.com/questions/256625/\
    //   how-to-set-restore-the-com-apple-quarantine-attribute
    use std::ffi::{c_void, CString};
    use std::os::fd::AsRawFd;
    use std::time::SystemTime;
    use uuid::Uuid;

    // Acquire current timestamp
    let now_timestamp = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    let value = format!(
        "0081;{:x};{};{}",
        now_timestamp,
        application,
        Uuid::new_v4()
    );

    let name = CString::new("com.apple.quarantine").unwrap();
    let value = value.as_bytes();
    let len = value.len();
    let value = value.as_ptr() as *const c_void;

    // Set quarantine flag on file
    let return_value = unsafe {
        libc::fsetxattr(
            file.as_raw_fd(),
            name.as_ptr(),
            value,
            len,
            0,
            libc::XATTR_CREATE,
        )
    };

    if return_value != 0 {
        return Err(std::io::Error::last_os_error());
    }

    Ok(())
}

/**************************************************************************
 * PROVIDERS
 * ************************************************************************* */

pub fn provide<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("downloader")
        .invoke_handler(tauri::generate_handler![download_file])
        .setup(|_| Ok(()))
        .build()
}

/**************************************************************************
 * TESTS
 * ************************************************************************* */

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split_filename() {
        assert_eq!(
            split_filename("file.tar.gz"),
            ("file".to_string(), ".tar.gz".to_string())
        );
        assert_eq!(
            split_filename("file.tar.bz2"),
            ("file".to_string(), ".tar.bz2".to_string())
        );
        assert_eq!(
            split_filename("file.tar.xz"),
            ("file".to_string(), ".tar.xz".to_string())
        );
        assert_eq!(
            split_filename("file.txt"),
            ("file".to_string(), ".txt".to_string())
        );
        assert_eq!(split_filename("file"), ("file".to_string(), "".to_string()));

        assert_eq!(
            split_filename("file..."),
            ("file..".to_string(), ".".to_string())
        );
        assert_eq!(
            split_filename("file.tar.gz.tar.gz"),
            ("file.tar.gz".to_string(), ".tar.gz".to_string())
        );
    }

    #[test]
    fn test_path_traversal() {
        assert_eq!(remove_path_traversal("file"), "file");
        assert_eq!(remove_path_traversal("file.txt"), "file.txt");
        assert_eq!(remove_path_traversal("file.tar.gz"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz/"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz\\"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz:"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz~"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz@"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz//"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz\\\\"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz::"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz~~"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz@@"), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz.."), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz...."), "file.tar.gz");
        assert_eq!(remove_path_traversal("file.tar.gz..\\.."), "file.tar.gz");
        assert_eq!(
            remove_path_traversal("C:\\file.tar.gz..//.."),
            "Cfile.tar.gz"
        );
        assert_eq!(remove_path_traversal("~/file.tar.gz..:.."), "file.tar.gz");
        assert_eq!(
            remove_path_traversal("../../../../file.tar.gz..~~.."),
            "file.tar.gz"
        );
        assert_eq!(remove_path_traversal("/file.tar.gz..@@.."), "file.tar.gz");
        assert_eq!(remove_path_traversal("/./."), "");
        assert_eq!(remove_path_traversal("/.../..."), "");
        assert_eq!(remove_path_traversal("\x00hi"), "hi");
        assert_eq!(remove_path_traversal("🤰🏽¨¬ø¡你好"), "🤰🏽¨¬ø¡你好");
    }
}
