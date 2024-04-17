// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

use log::LevelFilter;
use tauri::plugin::Plugin;
use tauri::Runtime;
use tauri_plugin_log::{LogTarget, RotationStrategy, TimezoneStrategy};

/**************************************************************************
 * PROVIDERS
 * ************************************************************************* */

pub fn provide<R: Runtime>() -> impl Plugin<R> {
    let time_format =
        time::format_description::parse("[[[year]-[month]-[day]][[[hour]:[minute]:[second]]")
            .unwrap();

    // Notice: filter which logs ultimately get ingested there (based on the \
    //   environment)
    #[cfg(dev)]
    let log_level = LevelFilter::Debug;

    #[cfg(not(dev))]
    let log_level = LevelFilter::Info;

    tauri_plugin_log::Builder::default()
        .rotation_strategy(RotationStrategy::KeepOne)
        .targets([LogTarget::LogDir, LogTarget::Stdout])
        .level(log_level)
        .format(move |out, message, record| {
            out.finish(format_args!(
                "{}[{}] {}",
                TimezoneStrategy::UseUtc
                    .get_now()
                    .format(&time_format)
                    .unwrap(),
                record.level(),
                message
            ))
        })
        .build()
}
