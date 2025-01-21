/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { App } from "vue";
import VueClickAway from "vue3-click-away";
import VueHotkey from "v-hotkey3";
import VResizable from "v-resizable";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * PLUGINS
 * ************************************************************************* */

class BootstrapPlugins {
  init(app: App): void {
    // Vue Logger
    app.use(logger);

    // Vue directives
    app.use(VueClickAway);
    app.use(VueHotkey);
    app.use(VResizable);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BootstrapPlugins();
