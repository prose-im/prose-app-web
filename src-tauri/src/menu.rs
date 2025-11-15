// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

#![allow(unused_imports)]

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use tauri::menu::{AboutMetadata, Menu, MenuBuilder, MenuEvent, MenuItem, SubmenuBuilder};
use tauri::tray::{TrayIcon, TrayIconBuilder};
use tauri::{AppHandle, Emitter, Manager, Runtime};

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const APP_NAME: &'static str = "Prose";

#[cfg(target_os = "windows")]
const LABEL_OPEN: &'static str = "Open Prose";
const LABEL_UPDATES: &'static str = "Check for Updates…";
const LABEL_SETTINGS: &'static str = "Account Settings…";
const LABEL_PROFILE: &'static str = "Edit Profile…";

/**************************************************************************
 * CREATORS
 * ************************************************************************* */

#[cfg(target_os = "macos")]
pub fn create<R: Runtime>(app: &AppHandle<R>) -> Result<Menu<R>, tauri::Error> {
    let menu = Menu::new(app)?;

    // Build 'About' sub-menu (macOS only)
    #[cfg(target_os = "macos")]
    {
        menu.append(
            &SubmenuBuilder::new(app, APP_NAME)
                .about(Some(AboutMetadata::default()))
                .text("updates", LABEL_UPDATES)
                .separator()
                .item(&MenuItem::with_id(
                    app,
                    "settings",
                    LABEL_SETTINGS,
                    true,
                    Some("Cmd+,"),
                )?)
                .text("profile", LABEL_PROFILE)
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

#[cfg(target_os = "windows")]
pub fn tray<R: Runtime>(app: &AppHandle<R>) -> Result<TrayIcon<R>, tauri::Error> {
    // Create menu (for tray)
    let menu = MenuBuilder::new(app)
        .text("open", LABEL_OPEN)
        .separator()
        .text("updates", LABEL_UPDATES)
        .separator()
        .text("settings", LABEL_SETTINGS)
        .text("profile", LABEL_PROFILE)
        .separator()
        .quit()
        .build()?;

    // Build tray icon
    TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip(APP_NAME)
        .menu(&menu)
        .build(app)
}

/**************************************************************************
 * HANDLERS
 * ************************************************************************* */

pub fn handler<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    if let Some(window) = app.get_webview_window("main") {
        window.emit("menu:select", event.id()).ok();
    }
}
