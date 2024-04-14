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
import CONFIG from "@/commons/config";

// PROJECT: UTILITIES
import { context as runtimeContext } from "@/utilities/runtime";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

// Notice: always enable logs in application contexts, since we are outputing \
//   logs to a filesystem-based log file there.
const enabled =
  CONFIG.environment !== "production" || runtimeContext === "application";

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
