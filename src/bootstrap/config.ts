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

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

/**************************************************************************
 * CONFIG
 * ************************************************************************* */

class BootstrapConfig {
  init(app: App): void {
    // Global configuration
    app.config.globalProperties.$CONFIG = CONFIG;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BootstrapConfig();
