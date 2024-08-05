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
 * CONSTANTS
 * ************************************************************************* */

const TIMEOUT_PING_DELAY = 15000; // 15 seconds

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionNativeTauri
  extends BrokerConnection
  implements ProseConnection
{
  private __connectionId?: RuntimeConnectionID;

  async connect(jidString: string, password: string): Promise<void> {
    logger.info(`Broker will connect via a native connection to: ${jidString}`);

    // Wait for connection status to change
    return new Promise((resolve, reject) => {
      // Initiate connection
      const id = this.__initiateConnection({
        succeed: resolve,
        fail: reject
      });

      // Acquire connection timeout
      // Notice: timeout should be a function of the ping interval, with a \
      //   slight delay on the top so that the server has time to respond to \
      //   a given ping. This sets up a realistic timeout where we are sure \
      //   that something occurs on the network channel in the timeout \
      //   timeframe. If nothing happens in this same timeframe, this means \
      //   that the connection is likely dead and should be considered as \
      //   timed out by the underlying connection manager.
      const timeout = this._pingIntervalTime() + TIMEOUT_PING_DELAY;

      // Request connection to connect
      // Important: trigger reject handler if runtime request failed
      UtilitiesRuntime.requestConnectionConnect(
        id,
        jidString,
        password,
        timeout
      ).catch(error => {
        // Intercept error for logging purposes
        logger.error("Broker failed to request a connection connect", error);

        reject(error);
      });
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
            logger.info("Broker connected");

            handlers.succeed();

            break;
          }

          case RuntimeConnectionState.Disconnected: {
            logger.warn("Broker disconnected");

            // Pass disconnected event to caller client
            if (this._eventHandler !== undefined) {
              this._eventHandler.handleDisconnect();
            } else {
              logger.warn(
                "Broker could not signal disconnection " +
                  "(no active event handler)"
              );
            }

            // Revoke connection
            this.__revokeConnection();

            break;
          }

          case RuntimeConnectionState.AuthenticationFailure: {
            logger.error("Broker authentication failure");

            handlers.fail(ProseConnectionErrorType.InvalidCredentials);

            break;
          }

          case RuntimeConnectionState.ConnectionTimeout: {
            logger.error("Broker connection timeout");

            handlers.fail(ProseConnectionErrorType.TimedOut);

            break;
          }

          case RuntimeConnectionState.ConnectionError: {
            logger.error("Broker connection error");

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

    // Start timers (for connection management)
    this._startTimers();

    return connectionId;
  }

  private async __revokeConnection(): Promise<void> {
    const connectionIdMaybe = this.__connectionId;

    // Stop timers (for connection management)
    this._stopTimers();

    if (this.__connectionId !== undefined) {
      // Revoke connection identifier
      delete this.__connectionId;
    }

    // Clear registered event handler (if any)
    if (this._eventHandler !== undefined) {
      delete this._eventHandler;
    }

    // Handle further cleanup work?
    if (connectionIdMaybe !== undefined) {
      // Unregister all runtime connection handlers
      UtilitiesRuntime.unregisterConnectionHandlers(connectionIdMaybe);

      // Request to fully destroy connection (forced destroy)
      try {
        await UtilitiesRuntime.requestConnectionDestroy(connectionIdMaybe);
      } catch (error) {
        logger.error("Broker failed to request a connection destroy", error);
      }
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
