/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

import fs from "fs";
import path from "path";
import merge from "lodash.merge";
import autoprefixer from "autoprefixer";
import vue from "@vitejs/plugin-vue";
import viteWasmPlugin from "vite-plugin-wasm";
import viteHtmlPlugin from "vite-plugin-html-config";
import vitePugPlugin from "vite-plugin-pug-transformer";
import { viteStaticCopy as viteStaticCopyPlugin } from "vite-plugin-static-copy";
import { createSvgIconsPlugin as viteSvgIconsPlugin } from "vite-plugin-svg-icons";
import { getInstalledPathSync } from "get-installed-path";

import BuilderInline from "./res/builders/inline";

import commonConfig from "./config/common";
import developmentConfig from "./config/development";
import productionConfig from "./config/production";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const PLATFORM_APPLICATION_OVERRIDE = process.env.TAURI_PLATFORM || null;

const PROSE_CORE_VIEWS_LOCAL_PATH = getInstalledPathSync(
  "@prose-im/prose-core-views",

  {
    local: true
  }
);

const PROSE_CORE_VIEWS_OVERRIDE_PATH = process.env.PROSE_CORE_VIEWS_PATH
  ? path.join(__dirname, process.env.PROSE_CORE_VIEWS_PATH)
  : null;

const PROSE_SDK_JS_OVERRIDE_PATH = process.env.PROSE_CORE_CLIENT_PATH
  ? path.join(
      __dirname,
      process.env.PROSE_CORE_CLIENT_PATH,
      "bindings/prose-sdk-js/pkg/"
    )
  : null;

const ASSETS_ICONS_PATH = path.join(__dirname, "src/assets/images/icons/");

const INLINE_DATA_ITEMS = {
  scripts: BuilderInline.scripts(PLATFORM_APPLICATION_OVERRIDE ? true : false),
  styles: BuilderInline.styles()
};

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
    },

    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"]
    }
  },

  preview: {
    host: "localhost",
    port: 3020,
    strictPort: true
  },

  build: {
    target: "es2022",
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
    alias: [
      { find: "@/", replacement: path.join(__dirname, "src/") },

      {
        // Use optional override to use a local 'prose-sdk-js' build
        find: "@prose-im/prose-sdk-js",
        replacement: PROSE_SDK_JS_OVERRIDE_PATH || "@prose-im/prose-sdk-js"
      },

      {
        // Use optional override to use a local 'prose-core-views' build
        find: "@prose-im/prose-core-views",

        replacement:
          PROSE_CORE_VIEWS_OVERRIDE_PATH || "@prose-im/prose-core-views"
      }
    ]
  },

  plugins: [
    vue(),
    vitePugPlugin({}),
    viteWasmPlugin(),

    viteHtmlPlugin({
      style: [INLINE_DATA_ITEMS.styles.loader].join(""),
      headScripts: [INLINE_DATA_ITEMS.scripts.loader]
    }),

    viteStaticCopyPlugin({
      targets: [
        {
          src: path.join(
            // Use optional override to use a local 'prose-core-view' build
            PROSE_CORE_VIEWS_OVERRIDE_PATH || PROSE_CORE_VIEWS_LOCAL_PATH,
            "dist",
            "*"
          ),

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
    exclude: ["@prose-im/prose-sdk-js"]
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
    },

    postcss: {
      plugins: [autoprefixer()]
    }
  },

  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,

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

      // Merge local configuration? (if any)
      try {
        const localConfig = JSON.parse(
          fs.readFileSync("./config/local.json", "utf8")
        );

        merge(config, localConfig);
      } catch (_) {
        // Ignore errors (local configuration not found)
      }

      // Replace platform with custom platform? (if any)
      // Notice: this only applies to Tauri builds (eg. macOS bundle)
      if (PLATFORM_APPLICATION_OVERRIDE) {
        merge(config, { platform: PLATFORM_APPLICATION_OVERRIDE });
      }

      return config;
    })()
  }
};
