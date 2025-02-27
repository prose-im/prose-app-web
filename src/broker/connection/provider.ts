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
import {
  default as UtilitiesRuntime,
  RuntimeConnectionMethod
} from "@/utilities/runtime";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionProvider implements ProseConnectionProvider {
  provideConnection(config: ProseClientConfig): ProseConnection {
    const methods = UtilitiesRuntime.acquireConnectionMethods();

    // Acquire preferred connection
    const preferConnection = Store.$settings.network.connection || "auto",
      preferAutomatic = preferConnection === "auto";

    // Native method available? (preferred if automatic)
    if (
      methods.includes(RuntimeConnectionMethod.Native) === true &&
      (preferAutomatic === true || preferConnection === "native")
    ) {
      return new BrokerConnectionNativeTauri(config);
    }

    // Relayed method available? (fallback if automatic)
    if (
      methods.includes(RuntimeConnectionMethod.Relayed) === true &&
      (preferAutomatic === true || preferConnection === "relayed")
    ) {
      return new BrokerConnectionRelayedStrophe(config);
    }

    // No method available
    throw new Error("No connection method available");
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerConnectionProvider;
