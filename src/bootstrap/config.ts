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
 * TYPES
 * ************************************************************************* */

type Config = typeof CONFIG;

/**************************************************************************
 * CONFIG
 * ************************************************************************* */

class BootstrapConfig {
  init(app: App): void {
    // Global configuration
    app.config.globalProperties.$config = CONFIG as Config;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { Config };
export default new BootstrapConfig();
