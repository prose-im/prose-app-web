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
import VueHotkey from "v-hotkey";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * PLUGINS
 * ************************************************************************* */

class BootstrapPlugins {
  init(app: App): void {
    // Vue Logger
    app.use(logger);

    // Vue directives (normal)
    app.use(VueClickAway);

    // Vue directives (manual)
    app.directive("hotkey", {
      beforeMount: VueHotkey.directive.bind,
      updated: VueHotkey.directive.componentUpdated,
      unmounted: VueHotkey.directive.unbind
    });
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BootstrapPlugins();
