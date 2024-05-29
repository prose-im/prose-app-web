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
import { nanoid } from "nanoid";

// PROJECT: BROKER
import BrokerConnection from "@/broker/connection/index";

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  RuntimeConnectionState,
  RuntimeConnectionID
} from "@/utilities/runtime";
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionNativeTauri
  extends BrokerConnection
  implements ProseConnection
{
  private __connectionId?: RuntimeConnectionID;

  async connect(jidString: string, password: string): Promise<void> {
    // Wait for connection status to change
    return new Promise((resolve, reject) => {
      // Initiate connection
      const id = this.__initiateConnection({
        succeed: resolve,
        fail: reject
      });

      // Request connection to connect
      // Important: trigger reject handler if runtime request failed
      UtilitiesRuntime.requestConnectionConnect(id, jidString, password).catch(
        reject
      );
    });
  }

  async disconnect(): Promise<void> {
    // Request connection to disconnect (if any)
    if (this.__connectionId !== undefined) {
      await UtilitiesRuntime.requestConnectionDisconnect(this.__connectionId);
    }
  }

  async sendStanza(stanza: string): Promise<void> {
    // Assert connection identifier
    if (this.__connectionId === undefined) {
      throw new Error("Cannot send stanza, connection not initiated");
    }

    // Request to send stanza on connection
    await UtilitiesRuntime.requestConnectionSend(this.__connectionId, stanza);

    // Trigger output event handler
    this._onOutput(stanza);
  }

  protected _protocol(): string {
    return "XMPP/TCP";
  }

  private __initiateConnection(handlers: {
    succeed: () => void;
    fail: (error: ProseConnectionErrorType) => void;
  }): RuntimeConnectionID {
    // Generate new connection ID
    const connectionId = nanoid();

    // Register all connection handlers
    UtilitiesRuntime.registerConnectionHandlers(connectionId, {
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

          case RuntimeConnectionState.ConnectionTimeout: {
            logger.error("Connection timeout");

            handlers.fail(ProseConnectionErrorType.TimedOut);

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

    // Assign connection identifier
    this.__connectionId = connectionId;

    return connectionId;
  }

  private __revokeConnection(): void {
    const connectionIdMaybe = this.__connectionId;

    if (this.__connectionId !== undefined) {
      // Revoke connection identifier
      delete this.__connectionId;
    }

    // Clear registered event handler (if any)
    if (this._eventHandler !== undefined) {
      delete this._eventHandler;
    }

    // Unregister all runtime connection handlers?
    if (connectionIdMaybe !== undefined) {
      UtilitiesRuntime.unregisterConnectionHandlers(connectionIdMaybe);
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
