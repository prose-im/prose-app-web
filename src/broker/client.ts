/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  JID,
  ProseClient,
  ProseClientConfig,
  ProseConnectionError,
  ProseConnectionErrorType
} from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import {
  default as logger,
  enabled as loggerEnabled
} from "@/utilities/logger";

// PROJECT: BROKER
import Broker from "@/broker";
import BrokerConnection from "@/broker/connection";
import {
  VERSION_NAME,
  VERSION_REVISION,
  VERSION_SYSTEM
} from "@/broker/context";
import BrokerDelegate from "@/broker/delegate";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const RECONNECT_INTERVAL = 5000; // 5 seconds

const PING_INTERVAL_SECONDS = 60; // 1 minute

const LOGGING_ENABLED = loggerEnabled;
const LOGGING_LEVEL = "warn";
const LOGGING_STANZAS = loggerEnabled;

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerClient {
  authenticationJID?: JID;
  client?: ProseClient;

  private __delegate: BrokerDelegate;
  private __credentials?: { jid: JID; password: string };
  private __reconnectTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    // Initialize delegate
    this.__delegate = new BrokerDelegate();

    // Bind all delegate event handlers
    this.__bindDelegateEvents(this.__delegate);
  }

  async authenticate(jid: JID, password: string): Promise<void> {
    // Incomplete parameters?
    if (!password) {
      throw new Error("Please provide a password");
    }

    // Another connection active?
    if (
      Store.$session.connected === true ||
      Store.$session.connecting === true
    ) {
      throw new Error("Another connection already exists");
    }

    // Store credentials
    this.__credentials = {
      jid,
      password
    };

    // Store authentication JID
    this.authenticationJID = this.__credentials?.jid;

    await this.__connect(jid, password);
  }

  reconnect(afterDelay = 0): void {
    const credentials = this.__credentials;

    if (credentials === undefined) {
      throw new Error("Cannot reconnect: credentials are not set");
    }

    if (
      Store.$session.connected === true ||
      Store.$session.connecting === true
    ) {
      throw new Error("Cannot reconnect: connection is active");
    }

    // Cancel any scheduled reconnect timeout
    this.__cancelScheduledReconnectTimer();

    // Schedule reconnect
    this.__reconnectTimeout = setTimeout(async () => {
      delete this.__reconnectTimeout;

      try {
        logger.debug("Reconnecting now…");

        await this.__connect(credentials.jid, credentials.password);
      } catch (error) {
        // Ignore reconnection errors here
        logger.warn("Could not reconnect client", error);
      }
    }, afterDelay);
  }

  async observe(): Promise<void> {
    await Broker.$room.startObservingRooms();
  }

  async logout(): Promise<void> {
    // Unassign authentication JID
    this.authenticationJID = undefined;

    // Void stored credentials
    this.__credentials = undefined;

    // Disconnect client and flush its cache
    await this.client?.disconnect();
    await this.client?.deleteCachedData();

    // Void client
    delete this.client;

    // Reset all stores
    Store.reset();
  }

  private __onClientConnected(): void {
    Store.$session.setConnected(true);
    Store.$session.setConnecting(false);
  }

  private __onClientDisconnected(): void {
    Store.$session.setConnected(false);
    Store.$session.setConnecting(false);

    if (!this.__credentials) {
      return;
    }

    this.reconnect(RECONNECT_INTERVAL);
  }

  private async __connect(jid: JID, password: string): Promise<void> {
    // Mark as connecting
    Store.$session.setConnecting(true);

    // Initialize client? (or re-use existing client)
    if (this.client === undefined) {
      this.client = await ProseClient.init(
        new BrokerConnection(),
        this.__delegate,
        this.__configuration()
      );
    }

    try {
      // Connect client
      await this.client.connect(jid, password);
    } catch (error) {
      // Mark as disconnected
      Store.$session.setConnected(false);
      Store.$session.setConnecting(false);

      // Handle connection error (re-throw error after intercepting)
      if (error instanceof ProseConnectionError) {
        switch (error.type) {
          case ProseConnectionErrorType.TimedOut: {
            logger.error("Cannot connect: timed out");

            break;
          }

          case ProseConnectionErrorType.InvalidCredentials: {
            logger.error("Cannot connect: invalid credentials");

            break;
          }

          case ProseConnectionErrorType.Generic: {
            logger.error("Cannot connect: other reason");
            break;
          }
        }

        throw error.message;
      } else {
        throw error;
      }
    }
  }

  private __configuration(): ProseClientConfig {
    const config = new ProseClientConfig();

    // Configure logging
    config.loggingEnabled = LOGGING_ENABLED;
    config.loggingMinLevel = LOGGING_LEVEL;
    config.logReceivedStanzas = LOGGING_STANZAS;
    config.logSentStanzas = LOGGING_STANZAS;

    // Configure connection
    config.pingInterval = PING_INTERVAL_SECONDS;

    // Configure client identity
    config.clientName = VERSION_NAME;
    config.clientVersion = VERSION_REVISION;
    config.clientOS = VERSION_SYSTEM;

    return config;
  }

  private __bindDelegateEvents(delegate: BrokerDelegate): void {
    const events: { [event: string]: () => void } = {
      "client:connected": this.__onClientConnected,
      "client:disconnected": this.__onClientDisconnected
    };

    for (const eventName in events) {
      delegate.events().on(eventName, events[eventName].bind(this));
    }
  }

  private __cancelScheduledReconnectTimer(): void {
    if (this.__reconnectTimeout !== undefined) {
      clearTimeout(this.__reconnectTimeout);

      delete this.__reconnectTimeout;
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerClient;
