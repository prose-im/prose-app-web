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
import {
  ProseConnection,
  ProseConnectionProvider,
  ProseClientConfig,
  ProseConnectionEventHandler
} from "@prose-im/prose-sdk-js";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

export class JSConnectionProvider implements ProseConnectionProvider {
  provideConnection(config: ProseClientConfig): ProseConnection {
    return new StropheJSConnection(config);
  }
}

export class StropheJSConnection implements ProseConnection {
  private readonly __config: ProseClientConfig;
  private readonly __connection: Strophe.Connection;

  private __eventHandler?: ProseConnectionEventHandler;

  constructor(config: ProseClientConfig) {
    // Assign configuration
    this.__config = config;

    // Initialize connection
    const relayHost = CONFIG.hosts.websocket || null;

    if (!relayHost) {
      throw new Error("No relay host to connect to");
    }

    this.__connection = new Strophe.Connection(relayHost, { protocol: "wss" });

    this.__connection.maxRetries = 0;

    this.__connection.rawInput = data => {
      if (this.__config.logReceivedStanzas === true) {
        logger.debug("(in)", data);
      }

      if (this.__eventHandler !== undefined) {
        this.__eventHandler.handleStanza(data);
      }
    };
  }

  async connect(jid: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      this.__connection.connect(jid, password, status => {
        switch (status) {
          case Strophe.Status.CONNECTING: {
            logger.debug("Connecting…");

            break;
          }

          case Strophe.Status.CONNFAIL: {
            logger.error("Connection failure");

            reject(new Error("Something went wrong"));

            break;
          }

          case Strophe.Status.DISCONNECTING: {
            logger.debug("Disconnecting…");

            break;
          }

          case Strophe.Status.DISCONNECTED: {
            logger.warn("Disconnected");

            setTimeout(() => this.__eventHandler?.handleDisconnect());

            break;
          }

          case Strophe.Status.CONNECTED: {
            logger.info("Connected");

            resolve();

            break;
          }
        }
      });
    });
  }

  disconnect() {
    this.__connection.disconnect("logout");
  }

  sendStanza(stanza: string) {
    if (this.__config.logSentStanzas === true) {
      logger.debug("(out)", stanza);
    }

    const element = new DOMParser().parseFromString(
      stanza,
      "text/xml"
    ).firstElementChild;

    if (!element) {
      throw new Error("Failed to parse stanza");
    }

    this.__connection.send(element);
  }

  setEventHandler(handler: ProseConnectionEventHandler) {
    this.__eventHandler = handler;
  }
}
