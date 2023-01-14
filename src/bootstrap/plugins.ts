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

// PROJECT: UTILITIES
import logger from "../utilities/logger";

/**************************************************************************
 * COMPONENTS
 * ************************************************************************* */

class BootstrapPlugins {
  init(app: App): void {
    // Vue Logger
    app.use(logger);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new BootstrapPlugins();
