/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { ProseLogger } from "@prose-im/prose-sdk-js";
import { debug, error, info, warn } from "tauri-plugin-log-api";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerLogger implements ProseLogger {
  logDebug(message: string) {
    debug(message);
  }

  logInfo(message: string) {
    info(message);
  }

  logWarn(message: string) {
    warn(message);
  }

  logError(message: string) {
    error(message);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */
export default BrokerLogger;
