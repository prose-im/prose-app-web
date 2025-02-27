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

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  RuntimeConnectionMethod
} from "@/utilities/runtime";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionProvider implements ProseConnectionProvider {
  provideConnection(config: ProseClientConfig): ProseConnection {
    // List all available methods
    const methods = UtilitiesRuntime.acquireConnectionMethods();

    // Acquire preferred connection (from available priority list)
    const preferConnection = Store.$settings.network.connection || "auto";

    logger.debug(
      `Acquiring connection from preferred method: ${preferConnection}`
    );

    switch (preferConnection) {
      case "native": {
        // Request a native connection
        return this.__makeConnection(
          RuntimeConnectionMethod.Native,
          methods,
          config
        );
      }

      case "relayed": {
        // Request a relayed connection
        return this.__makeConnection(
          RuntimeConnectionMethod.Relayed,
          methods,
          config
        );
      }

      case "auto": {
        // Pick highest-priority method?
        if (methods.length > 0) {
          return this.__makeConnection(methods[0], methods, config);
        }

        throw new Error(
          "Automatic connection requested, but no method available"
        );
      }
    }

    // No method available
    throw new Error("No connection method available");
  }

  __makeConnection(
    method: RuntimeConnectionMethod,
    availableMethods: Array<RuntimeConnectionMethod>,
    config: ProseClientConfig
  ): ProseConnection {
    logger.debug(`Making connection using selected method: ${method}`);

    // Is the requested method available?
    if (availableMethods.includes(method) === true) {
      switch (method) {
        case RuntimeConnectionMethod.Native: {
          return new BrokerConnectionNativeTauri(config);
        }

        case RuntimeConnectionMethod.Relayed: {
          return new BrokerConnectionRelayedStrophe(config);
        }

        default: {
          throw new Error(`Cannot make connection using: ${method}`);
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
