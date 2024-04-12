/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { createLogger } from "vue-logger-plugin";

// PROJECT: COMMONS

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const enabled = true; //CONFIG.environment !== "production";
const level = "debug";

/**************************************************************************
 * LOGGER
 * ************************************************************************* */

const logger = createLogger({
  enabled,
  level,
  consoleEnabled: true,

  prefixFormat: ({ level, caller }) =>
    caller
      ? `[${level.toUpperCase()}] [${caller?.fileName}:${
          caller?.functionName
        }:${caller?.lineNumber}]`
      : `[${level.toUpperCase()}]`
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { enabled, level };
export default logger;
