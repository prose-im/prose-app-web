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
  ProseConnection,
  ProseConnectionErrorType,
  ProseConnectionEventHandler,
  ProseConnectionProvider
} from "@prose-im/prose-sdk-js";

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  RuntimeConnectionState
} from "@/utilities/runtime";
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionNativeTauri implements ProseConnection {
  private readonly __config: ProseClientConfig;

  private __initiated?: boolean;
  private __eventHandler?: ProseConnectionEventHandler;

  constructor(config: ProseClientConfig) {
    // Assign configuration
    this.__config = config;
  }

  async connect(jidString: string, password: string): Promise<void> {
    // Wait for connection status to change
    return new Promise((resolve, reject) => {
      // Initiate connection
      this.__initiateConnection({ succeed: resolve, fail: reject });

      // Request connection to connect
      // Important: trigger reject handler if runtime request failed
      UtilitiesRuntime.requestConnectionConnect(jidString, password).catch(
        reject
      );
    });
  }

  async disconnect(): Promise<void> {
    // Request connection to disconnect
    await UtilitiesRuntime.requestConnectionDisconnect();
  }

  async sendStanza(stanza: string): Promise<void> {
    // Assert initiated status
    if (this.__initiated !== true) {
      throw new Error("Cannot send stanza, connection not initiated");
    }

    // Request to send stanza on connection
    await UtilitiesRuntime.requestConnectionSend(stanza);

    // Trigger output event handler
    this.__onOutput(stanza);
  }

  setEventHandler(handler: ProseConnectionEventHandler): void {
    this.__eventHandler = handler;
  }

  private __initiateConnection(handlers: {
    succeed: () => void;
    fail: (error: ProseConnectionErrorType) => void;
  }): void {
    // Register all connection handlers
    UtilitiesRuntime.registerConnectionHandlers({
      state: (state: RuntimeConnectionState) => {
        switch (state) {
          case RuntimeConnectionState.Connected: {
            logger.info("Connected");

            handlers.succeed();

            break;
          }

          case RuntimeConnectionState.Disconnected: {
            logger.warn("Disconnected");

            // Pass disconnected event to caller client
            this.__eventHandler?.handleDisconnect();

            // Revoke connection
            this.__revokeConnection();

            break;
          }

          case RuntimeConnectionState.AuthenticationFailure: {
            logger.error("Authentication failure");

            handlers.fail(ProseConnectionErrorType.InvalidCredentials);

            break;
          }

          case RuntimeConnectionState.ConnectionError: {
            logger.error("Connection error");

            handlers.fail(ProseConnectionErrorType.Generic);

            break;
          }
        }
      },

      receive: (stanza: string) => {
        // Trigger input event handler
        this.__onInput(stanza);
      }
    });

    // Mark as initiated
    this.__initiated = true;
  }

  private __revokeConnection(): void {
    if (this.__initiated !== undefined) {
      // Revoke initiated marker
      delete this.__initiated;
    }

    // Clear registered event handler (if any)
    if (this.__eventHandler !== undefined) {
      delete this.__eventHandler;
    }

    // Unregister all runtime connection handlers
    UtilitiesRuntime.unregisterConnectionHandlers();
  }

  private __onInput(data: string): void {
    // Trace raw input?
    if (this.__config.logReceivedStanzas === true) {
      logger.debug("🔵 XMPP/TCP IN", data);
    }

    // Pass to event handler?
    if (this.__eventHandler !== undefined) {
      this.__eventHandler.handleStanza(data);
    }
  }

  private __onOutput(data: string): void {
    // Trace raw output?
    if (this.__config.logSentStanzas === true) {
      logger.debug("🔴 XMPP/TCP OUT", data);
    }
  }
}

class BrokerConnectionNative implements ProseConnectionProvider {
  provideConnection(config: ProseClientConfig): ProseConnection {
    return new BrokerConnectionNativeTauri(config);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerConnectionNative;
