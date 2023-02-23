/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Strophe } from "strophe.js";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

interface ConnectLifecycle {
  success: (value: void) => void;
  failure: (error: Error) => void;
}

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerClient {
  private __connection: Strophe.Connection;
  private __connectLifecycle?: ConnectLifecycle;

  async authenticate(jid: string, password: string): Promise<void> {
    // Acquire relay host
    const relayHost = CONFIG.hosts.websocket || null;

    if (!relayHost) {
      throw new Error("No relay host configured");
    }

    // Incomplete parameters?
    if (!jid) {
      throw new Error("Please provide a Jabber ID");
    }
    if (!password) {
      throw new Error("Please provide a password");
    }
    if (jid.includes("@") === false) {
      throw new Error("Invalid Jabber ID");
    }

    // Another connection pending?
    if (this.__connectLifecycle) {
      throw new Error("Another connection is pending");
    }

    // Another connection active?
    if (this.__connection) {
      throw new Error("Another connection already exist");
    }

    // Create connection
    this.__connection = new Strophe.Connection(relayHost, {
      protocol: "wss"
    });

    // Bind handlers
    this.__connection.rawInput = this.__onInput.bind(this);
    this.__connection.rawOutput = this.__onOutput.bind(this);

    await new Promise((resolve, reject) => {
      // Assign lifecycle handlers
      this.__connectLifecycle = {
        success: resolve,
        failure: reject
      };

      // Connect to server
      this.__connection.connect(jid, password, this.__onConnect.bind(this));
    }).catch(error => {
      throw error;
    });
  }

  private __onConnect(status: Strophe.Status): void {
    switch (status) {
      case Strophe.Status.CONNECTING: {
        logger.debug("Connecting...");

        break;
      }

      case Strophe.Status.DISCONNECTING: {
        logger.debug("Disconnecting...");

        break;
      }

      case Strophe.Status.DISCONNECTED: {
        logger.warn("Disconnected");

        this.__raiseConnectLifecycle(new Error("Disconnected from server"));

        break;
      }

      case Strophe.Status.CONNECTED: {
        logger.info("Connected");

        this.__raiseConnectLifecycle();

        break;
      }

      case Strophe.Status.CONNFAIL: {
        logger.error("Connection failure");

        this.__raiseConnectLifecycle(new Error("Failed to authenticate"));

        break;
      }
    }
  }

  private __onInput(data: object): void {
    logger.log("(in)", data);
  }

  private __onOutput(data: object): void {
    logger.log("(out)", data);
  }

  private __raiseConnectLifecycle(error?: Error): void {
    if (this.__connectLifecycle) {
      if (error) {
        this.__connectLifecycle.failure(error);
      } else {
        this.__connectLifecycle.success();
      }

      delete this.__connectLifecycle;
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerClient;
