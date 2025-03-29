/*
 * This file is part of prose-app-web
 *
 * Copyright 2025, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { App } from "vue";

// PROJECT: STYLES
import styleExportsColors from "@/assets/stylesheets/exports/_exports.colors.module.scss";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Styles {
  colors: typeof styleExportsColors;
}

/**************************************************************************
 * CONFIG
 * ************************************************************************* */

class BootstrapStyles {
  init(app: App): void {
    // Global configuration
    app.config.globalProperties.$styles = {
      colors: styleExportsColors
    } as Styles;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { Styles };
export default new BootstrapStyles();
