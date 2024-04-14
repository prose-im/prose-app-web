/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { createLogger, LoggerHook, LogEvent } from "vue-logger-plugin";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: UTILITIES
import { context as runtimeContext } from "@/utilities/runtime";
import {
  default as UtilitiesRuntime,
  RuntimeLogLevel
} from "@/utilities/runtime";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

// Notice: always enable logs in application contexts, since we are outputing \
//   logs to a filesystem-based log file there.
const enabled =
  CONFIG.environment !== "production" || runtimeContext === "application";

const level = CONFIG.environment === "production" ? "warn" : "debug";

/**************************************************************************
 * HOOKS
 * ************************************************************************* */

const LoggerLogHook: LoggerHook = {
  run(event: LogEvent) {
    // Notice: cast Vue logger level to our internal runtime log level, since \
    //   their string values are the same then this works as-is without \
    //   manually remapping each value.
    UtilitiesRuntime.requestLog(
      event.level as RuntimeLogLevel,
      ...event.argumentArray
    );
  }
};

/**************************************************************************
 * LOGGER
 * ************************************************************************* */

const logger = createLogger({
  enabled,
  level,
  consoleEnabled: false,
  afterHooks: [LoggerLogHook]
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { enabled, level };
export default logger;
