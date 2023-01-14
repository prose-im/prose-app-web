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

/**************************************************************************
 * COMPONENTS
 * ************************************************************************* */

const logger = createLogger({
  enabled: process.env.NODE_ENV !== "production",
  consoleEnabled: true,
  level: "debug",

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

export default logger;
