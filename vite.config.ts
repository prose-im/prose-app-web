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
  plugins: [vue(), vitePugPlugin({})],

  css: {
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
