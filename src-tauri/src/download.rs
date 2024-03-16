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

#[derive(Debug, Clone, serde::Serialize)]
struct DownloadProgress {
    id: u64,
    progress: usize,
    total: usize,
}

#[derive(Serialize, Deserialize, Debug, Error, PartialEq, Eq)]
pub enum DownloadError {
    #[error("Could not obtain download directory")]
    CouldNotObtainDirectory,
    #[error("Packet is too small, missing bytes")]
    CouldNotCreateFile,
    #[error("Could not download file")]
    DownloadError,
}

#[tauri::command]
pub async fn download_file<R: Runtime>(
    window: Window<R>,
    id: u64,
    url: &str,
    filename: &str,
) -> Result<String, DownloadError> {
    let mut filename = filename.to_string();
    // if no filename provided, use the last part of the url
    if filename.is_empty() || filename == "undefined" {
        let url_fragment = url.split('/').last().unwrap_or("");
        filename = percent_decode(url_fragment.as_ref())
            .decode_utf8_lossy()
            .to_string();
    }

    filename = remove_path_traversal(&filename);

    if filename.is_empty() {
        filename = "file".to_string();
    }

    // fetch the download directory
    let user_dirs = UserDirs::new().ok_or_else(|| DownloadError::CouldNotObtainDirectory)?;
    let download_dir = user_dirs
        .download_dir()
        .ok_or_else(|| DownloadError::CouldNotObtainDirectory)?;
    let mut download_path = download_dir.join(&filename);

    // if the file already exists, add a number to the filename
    let (pure_filename, filename_extension) = split_filename(&filename);
    let mut i = 1;
    while download_path.exists() {
        download_path = download_dir.join(format!("{pure_filename} ({i}){filename_extension}"));
        i += 1;
    }

    let mut response = reqwest::get(url)
        .await
        .map_err(|_| DownloadError::DownloadError)?;

    let mut file = File::create(&download_path)
        .await
        .map_err(|_| DownloadError::CouldNotCreateFile)?;

    let total_size = response.content_length().unwrap_or(0) as usize;
    let mut downloaded = 0;
    let mut last_report = Instant::now();
    while let Some(chunk) = response
        .chunk()
        .await
        .map_err(|_| DownloadError::DownloadError)?
    {
        file.write_all(&chunk)
            .await
            .map_err(|_| DownloadError::DownloadError)?;

        downloaded = min(downloaded + chunk.len(), total_size);

        if last_report.elapsed().as_millis() > 100 {
            last_report = Instant::now();
            window
                .emit(
                    "download://progress",
                    DownloadProgress {
                        id,
                        progress: downloaded,
                        total: total_size,
                    },
                )
                .unwrap();
        }
    }

    file.flush()
        .await
        .map_err(|_| DownloadError::DownloadError)?;
    println!("Downloaded {}", download_path.to_string_lossy());
    Ok(download_path.to_string_lossy().to_string())
}

/// Splits file into pure filename and extension while conserving double file extensions (.tar.gz, .tar.bz2, .tar.xz)
fn split_filename(filename: &str) -> (String, String) {
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

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("downloader")
        .invoke_handler(tauri::generate_handler![download_file])
        .setup(|_app_handle| {
            // setup plugin specific state here
            //app_handle.manage(MyState::default());
            Ok(())
        })
        .build()
}

fn remove_path_traversal(filename: &str) -> String {
    // todo path traversal not secure yet
    // can't use fs::canonicalize because it doesn't work with non-existing files
    // many path traversal crates are based on fs::canonicalize, therefore they also can't be used
    filename
        .replace(|c| c < ' ', "") // remove control characters
        .replace(['/', '\\', ':', '~', '@', '?', '[', ']'], "") // remove all path separators
        .replace("..", "") // remove path traversal
}

// Test
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
