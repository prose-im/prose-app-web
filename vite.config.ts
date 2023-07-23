/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

import path from "path";
import merge from "lodash.merge";
import vue from "@vitejs/plugin-vue";
import vitePugPlugin from "vite-plugin-pug-transformer";
import { viteStaticCopy as viteStaticCopyPlugin } from "vite-plugin-static-copy";
import { createSvgIconsPlugin as viteSvgIconsPlugin } from "vite-plugin-svg-icons";
import { getInstalledPathSync } from "get-installed-path";
import wasm from "vite-plugin-wasm";

import commonConfig from "./config/common";
import developmentConfig from "./config/development";
import productionConfig from "./config/production";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const PROSE_CORE_VIEWS_PATH = getInstalledPathSync(
  "@prose-im/prose-core-views",

  {
    local: true
  }
);

const ASSETS_ICONS_PATH = path.join(__dirname, "src/assets/images/icons/");

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
    strictPort: true,
    fs: {
      strict: false
    }
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
    wasm(),

    viteStaticCopyPlugin({
      targets: [
        {
          src: path.join(PROSE_CORE_VIEWS_PATH, "dist", "*"),
          dest: "includes/views"
        }
      ]
    }),

    viteSvgIconsPlugin({
      iconDirs: [ASSETS_ICONS_PATH],
      symbolId: "icon-[name]",
      inject: "body-last",
      customDomId: "__svg__icons__",
      svgoOptions: false
    })
  ],

  optimizeDeps: {
    // Workaround for https://github.com/vitejs/vite/issues/8427
    exclude: ['@prose-im/prose-core-client-wasm']
  },

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
  },

  define: {
    __CONFIG__: (function () {
      const config = {};

      // Merge common configuration
      merge(config, commonConfig);

      // Merge per-environment configuration
      switch (process.env.NODE_ENV) {
        case "production": {
          merge(config, productionConfig);

          break;
        }

        default: {
          merge(config, developmentConfig);
        }
      }

      return config;
    })()
  }
};
