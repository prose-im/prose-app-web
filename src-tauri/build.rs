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
                tauri_build::InlinedPlugin::new().commands(&["file"]),
            )
            .plugin(
                "notifications",
                tauri_build::InlinedPlugin::new().commands(&["send_native", "set_badge_count"]),
            ),
    )
    .expect("failed to run tauri-build");
}
