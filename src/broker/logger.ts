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

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  RuntimeLogLevel
} from "@/utilities/runtime";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerLogger implements ProseLogger {
  logDebug(message: string): void {
    UtilitiesRuntime.requestLog(RuntimeLogLevel.Debug, message);
  }

  logInfo(message: string): void {
    UtilitiesRuntime.requestLog(RuntimeLogLevel.Info, message);
  }

  logWarn(message: string): void {
    UtilitiesRuntime.requestLog(RuntimeLogLevel.Warn, message);
  }

  logError(message: string): void {
    UtilitiesRuntime.requestLog(RuntimeLogLevel.Error, message);
  }

  logPanic(message: string): void {
    UtilitiesRuntime.requestLog(RuntimeLogLevel.Error, message);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerLogger;
