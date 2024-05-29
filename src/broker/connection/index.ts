/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  ProseClientConfig,
  ProseConnectionEventHandler
} from "@prose-im/prose-sdk-js";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

abstract class BrokerConnection {
  private readonly __config: ProseClientConfig;

  protected _eventHandler?: ProseConnectionEventHandler;

  constructor(config: ProseClientConfig) {
    // Assign configuration
    this.__config = config;
  }

  setEventHandler(handler: ProseConnectionEventHandler): void {
    this._eventHandler = handler;
  }

  protected _protocol(): string {
    // This method might be overloaded to re-specify a finer protocol
    return "XMPP";
  }

  protected _onInput(data: string): void {
    // Trace raw input?
    if (this.__config.logReceivedStanzas === true) {
      logger.debug(`🔵 ${this._protocol()} IN`, data);
    }

    // Pass to event handler?
    if (this._eventHandler !== undefined) {
      this._eventHandler.handleStanza(data);
    }
  }

  protected _onOutput(data: string): void {
    // Trace raw output?
    if (this.__config.logSentStanzas === true) {
      logger.debug(`🔴 ${this._protocol()} OUT`, data);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerConnection;
