/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

import { defineConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import vitePugPlugin from "vite-plugin-pug-transformer";

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default defineConfig({
  plugins: [vue(), vitePugPlugin()]
});
