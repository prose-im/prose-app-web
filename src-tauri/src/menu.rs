// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use tauri::menu::{AboutMetadata, Menu, MenuEvent, MenuItem, SubmenuBuilder};
use tauri::{AppHandle, Emitter, Manager, Runtime};

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const APP_NAME: &'static str = "Prose";

/**************************************************************************
 * CREATORS
 * ************************************************************************* */

pub fn create<R: Runtime>(app: &AppHandle<R>) -> Result<Menu<R>, tauri::Error> {
    let menu = Menu::new(app)?;

    // Build 'About' sub-menu (macOS only)
    #[cfg(target_os = "macos")]
    {
        menu.append(
            &SubmenuBuilder::new(app, APP_NAME)
                .about(Some(AboutMetadata::default()))
                .text("updates", "Check for Updates…")
                .separator()
                .item(&MenuItem::with_id(
                    app,
                    "settings",
                    "Account Settings…",
                    true,
                    Some("Cmd+,"),
                )?)
                .text("profile", "Edit Profile…")
                .separator()
                .hide()
                .hide_others()
                .show_all()
                .separator()
                .quit()
                .build()?,
        )?;
    }

    // Build 'File' sub-menu
    {
        let mut submenu = SubmenuBuilder::new(app, "File");

        submenu = submenu.close_window();

        #[cfg(not(target_os = "macos"))]
        {
            submenu = submenu.quit();
        }

        menu.append(&submenu.build()?)?;
    }

    // Build 'Edit' sub-menu
    menu.append(
        &SubmenuBuilder::new(app, "Edit")
            .undo()
            .redo()
            .separator()
            .cut()
            .copy()
            .paste()
            .select_all()
            .build()?,
    )?;

    // Build 'View' sub-menu (macOS only)
    #[cfg(target_os = "macos")]
    {
        menu.append(&SubmenuBuilder::new(app, "View").fullscreen().build()?)?
    };

    // Build 'Window' sub-menu
    menu.append(
        &SubmenuBuilder::new(app, "Window")
            .minimize()
            .maximize()
            .close_window()
            .build()?,
    )?;

    Ok(menu)
}

/**************************************************************************
 * HANDLERS
 * ************************************************************************* */

pub fn handler<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    if let Some(window) = app.get_webview_window("main") {
        window.emit("menu:select", event.id()).ok();
    }
}
