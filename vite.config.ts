/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

import path from "path";
import vue from "@vitejs/plugin-vue";
import vitePugPlugin from "vite-plugin-pug-transformer";
import { viteStaticCopy as viteStaticCopyPlugin } from "vite-plugin-static-copy";
import { getInstalledPathSync } from "get-installed-path";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const PROSE_CORE_VIEWS_PATH = getInstalledPathSync(
  "@prose-im/prose-core-views",

  {
    local: true
  }
);

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default {
  base: "/",
  publicDir: "public",
  logLevel: "info",

  server: {
    host: "localhost",
    port: 3010,
    strictPort: true
  },

  preview: {
    host: "localhost",
    port: 3020,
    strictPort: true
  },

  build: {
    target: "modules",
    outDir: "dist",
    assetsDir: "assets",
    cssCodeSplit: true,
    sourcemap: false,
    manifest: false,
    copyPublicDir: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1024
  },

  resolve: {
    alias: [{ find: "@/", replacement: path.join(__dirname, "src/") }]
  },

  plugins: [
    vue(),
    vitePugPlugin({}),

    viteStaticCopyPlugin({
      targets: [
        {
          src: path.join(PROSE_CORE_VIEWS_PATH, "dist", "*"),
          dest: "includes/views"
        }
      ]
    })
  ],

  css: {
    devSourcemap: false,

    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/assets/stylesheets/variables/all.scss";
          @import "@/assets/stylesheets/tools/all.scss";
        `
      }
    }
  }
};
