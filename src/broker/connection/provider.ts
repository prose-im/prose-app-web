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
  ProseConnectionProvider
} from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import { BrokerConnectionNativeTauri } from "@/broker/connection/native";
import { BrokerConnectionRelayedStrophe } from "@/broker/connection/relayed";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import {
  default as UtilitiesRuntime,
  RuntimeConnectionMethod
} from "@/utilities/runtime";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionProvider implements ProseConnectionProvider {
  private __connectMethods: Array<RuntimeConnectionMethod>;

  private __nextConnectMethodIndex = 0;

  constructor() {
    // Acquire available connection methods
    this.__connectMethods = UtilitiesRuntime.acquireConnectionMethods();
  }

  provideConnection(config: ProseClientConfig): ProseConnection {
    // Acquire preferred connection (from available priority list)
    const preferConnection = Store.$settings.network.connection || "auto";

    logger.debug(
      `Acquiring connection from preferred method: ${preferConnection}`
    );

    switch (preferConnection) {
      case "native": {
        // Request a native connection
        return this.__acquireConnection(RuntimeConnectionMethod.Native, config);
      }

      case "relayed": {
        // Request a relayed connection
        return this.__acquireConnection(
          RuntimeConnectionMethod.Relayed,
          config
        );
      }

      case "auto": {
        // Acquire highest-priority connection method (the next method is only \
        //   served if reconnecting)
        const nextMethod =
          this.__connectMethods[this.__nextConnectMethodIndex] || null;

        // Request a connection, using the acquired next method
        // Notice: the next method counter lets Prose converge to a stable \
        //   connection method, which is very useful in cases where a native \
        //   connection is attempted in priority, but where the current \
        //   network has a firewall into place that prevents native XMPP \
        //   connections; in this specific case, Prose will attempt a second \
        //   reconnect over WebSocket, and succeed establishing the connection \
        //   there. On most networks, the next method will always be the first \
        //   method in the list of available methods.
        if (nextMethod !== null) {
          return this.__acquireConnection(nextMethod, config);
        }

        throw new Error("Could not find a next connection method");
      }
    }

    // No method available
    throw new Error("No connection method available");
  }

  rollToNextConnectMethod(): void {
    // Increment next connect method
    this.__nextConnectMethodIndex++;

    // Circle back to first method
    if (this.__nextConnectMethodIndex >= this.__connectMethods.length) {
      this.__nextConnectMethodIndex = 0;
    }
  }

  resetNextConnectMethod(): void {
    // Reset back to first method
    this.__nextConnectMethodIndex = 0;
  }

  private __acquireConnection(
    method: RuntimeConnectionMethod,
    config: ProseClientConfig
  ): ProseConnection {
    logger.debug(`Acquiring connection using selected method: ${method}`);

    // Is the requested method available?
    if (this.__connectMethods.includes(method) === true) {
      switch (method) {
        case RuntimeConnectionMethod.Native: {
          return new BrokerConnectionNativeTauri(config);
        }

        case RuntimeConnectionMethod.Relayed: {
          return new BrokerConnectionRelayedStrophe(config);
        }

        default: {
          throw new Error(`Cannot acquire connection using: ${method}`);
        }
      }
    }

    throw new Error(
      `Connection method requested, but not available: ${method}`
    );
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerConnectionProvider;
