// This file is part of prose-app-web
//
// Copyright 2024, Prose Foundation

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

extern crate cc;
use std::env;

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const DEPLOYMENT_TARGET_VAR: &str = "MACOSX_DEPLOYMENT_TARGET";

/**************************************************************************
 * MAIN
 * ************************************************************************* */

fn main() {
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("macos") {
        let min_version = env::var(DEPLOYMENT_TARGET_VAR).unwrap_or_else(|_| {
            String::from(match env::var("CARGO_CFG_TARGET_ARCH").unwrap().as_str() {
                "x86_64" => "10.0",
                "aarch64" => "11.0",
                arch => panic!("unknown arch: {}", arch),
            })
        });

        cc::Build::new()
            .file("objc/helper.m")
            .flag("-fmodules")
            .flag("-Wno-deprecated-declarations")
            .flag(&format!("-mmacos-version-min={}", min_version))
            .compile("helper");
        cc::Build::new()
            .file("objc/notification.m")
            .flag("-fmodules")
            .flag("-Wno-deprecated-declarations")
            .flag(&format!("-mmacos-version-min={}", min_version))
            .compile("notification");

        println!("cargo:rerun-if-env-changed={}", DEPLOYMENT_TARGET_VAR);
        println!("cargo:rerun-if-changed=build.rs");
        println!("cargo:rerun-if-changed=objc");
    }
}
