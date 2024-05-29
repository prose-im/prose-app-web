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
  ProseConnectionProvider
} from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerConnection from "@/broker/connection/index";

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  RuntimeConnectionState
} from "@/utilities/runtime";
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionNativeTauri
  extends BrokerConnection
  implements ProseConnection
{
  private __initiated?: boolean;

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
    this._onOutput(stanza);
  }

  protected _protocol(): string {
    return "XMPP/TCP";
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
            this._eventHandler?.handleDisconnect();

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
        this._onInput(stanza);
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
    if (this._eventHandler !== undefined) {
      delete this._eventHandler;
    }

    // Unregister all runtime connection handlers
    UtilitiesRuntime.unregisterConnectionHandlers();
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
