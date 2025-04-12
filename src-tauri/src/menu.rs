// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use tauri::{AboutMetadata, CustomMenuItem, Menu, MenuItem, Submenu, Emitter};

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const APP_NAME: &'static str = "Prose";
const APP_WEBSITE: &'static str = "https://prose.org";

/**************************************************************************
 * CREATORS
 * ************************************************************************* */

pub fn create() -> Menu {
    // Build main menu
    let mut menu = Menu::new();

    #[cfg(target_os = "macos")]
    {
        let about = AboutMetadata::default().website(APP_WEBSITE);

        menu = menu.add_submenu(Submenu::new(
            APP_NAME,
            Menu::new()
                .add_native_item(MenuItem::About(APP_NAME.to_string(), about))
                .add_item(CustomMenuItem::new("updates", "Check for Updates…"))
                .add_native_item(MenuItem::Separator)
                .add_item(CustomMenuItem::new("settings", "Account Settings…").accelerator("Cmd+,"))
                .add_item(CustomMenuItem::new("profile", "Edit Profile…"))
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Hide)
                .add_native_item(MenuItem::HideOthers)
                .add_native_item(MenuItem::ShowAll)
                .add_native_item(MenuItem::Separator)
                .add_native_item(MenuItem::Quit),
        ));
    }

    // Build file sub-menu
    let mut file_menu = Menu::new();

    file_menu = file_menu.add_native_item(MenuItem::CloseWindow);

    #[cfg(not(target_os = "macos"))]
    {
        file_menu = file_menu.add_native_item(MenuItem::Quit);
    }

    menu = menu.add_submenu(Submenu::new("File", file_menu));

    // Build edit sub-menu
    #[cfg(not(target_os = "linux"))]
    let mut edit_menu = Menu::new();

    #[cfg(target_os = "macos")]
    {
        edit_menu = edit_menu.add_native_item(MenuItem::Undo);
        edit_menu = edit_menu.add_native_item(MenuItem::Redo);
        edit_menu = edit_menu.add_native_item(MenuItem::Separator);
    }

    #[cfg(not(target_os = "linux"))]
    {
        edit_menu = edit_menu.add_native_item(MenuItem::Cut);
        edit_menu = edit_menu.add_native_item(MenuItem::Copy);
        edit_menu = edit_menu.add_native_item(MenuItem::Paste);
    }

    #[cfg(target_os = "macos")]
    {
        edit_menu = edit_menu.add_native_item(MenuItem::SelectAll);
    }

    #[cfg(not(target_os = "linux"))]
    {
        menu = menu.add_submenu(Submenu::new("Edit", edit_menu));
    }

    // Build view sub-menu
    #[cfg(target_os = "macos")]
    {
        menu = menu.add_submenu(Submenu::new(
            "View",
            Menu::new().add_native_item(MenuItem::EnterFullScreen),
        ));
    }

    // Build window sub-menu
    let mut window_menu = Menu::new();

    window_menu = window_menu.add_native_item(MenuItem::Minimize);

    #[cfg(target_os = "macos")]
    {
        window_menu = window_menu.add_native_item(MenuItem::Zoom);
        window_menu = window_menu.add_native_item(MenuItem::Separator);
    }

    window_menu = window_menu.add_native_item(MenuItem::CloseWindow);

    menu = menu.add_submenu(Submenu::new("Window", window_menu));

    menu
}

/**************************************************************************
 * HANDLERS
 * ************************************************************************* */

pub fn handler(event: tauri::WindowMenuEvent) {
    let _ = event.window().emit("menu:select", event.menu_item_id());
}
