// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

fn main() {
    // Important: expose all built-in commands here, otherwise the front-end \
    //   will not be authorized to call them.
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .plugin(
                "connection",
                tauri_build::InlinedPlugin::new().commands(&[
                    "connect",
                    "disconnect",
                    "destroy",
                    "send",
                ]),
            )
            .plugin(
                "download",
                tauri_build::InlinedPlugin::new().commands(&["download_file"]),
            )
            .plugin(
                "notification",
                tauri_build::InlinedPlugin::new()
                    .commands(&["send_notification", "set_badge_count"]),
            ),
    )
    .expect("failed to run tauri-build");
}
