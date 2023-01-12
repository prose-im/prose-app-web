/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

import vue from "@vitejs/plugin-vue";
import vitePugPlugin from "vite-plugin-pug-transformer";

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

  plugins: [vue(), vitePugPlugin({})],

  css: {
    devSourcemap: false,

    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "/src/assets/stylesheets/variables/all.scss";
          @import "/src/assets/stylesheets/tools/all.scss";
        `
      }
    }
  }
};