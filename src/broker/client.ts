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
import EncryptionService from "@/broker/encryption_service";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const RECONNECT_INTERVAL = 4000; // 4 seconds
const RECONNECT_ATTEMPTS_COUNT_CAP = 15;

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

  private __reconnectAttempts = 0;
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

  reconnect(afterBaseDelay = 0): void {
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

    // Bump reconnect attempts count? (only if a non-zero delay is set, that \
    //   is, if this reconnect attempt is not manual)
    // Notice: reset reconnect attempts count back to a value of one if the \
    //   user interacted and requested a manual reconnection, since it \
    //   signaled its presence on screen, therefore we can start being more \
    //   aggressive with automatic retries again.
    if (afterBaseDelay > 0) {
      // Cap reconnect attempts to a maximum value (that's reasonable)
      if (this.__reconnectAttempts < RECONNECT_ATTEMPTS_COUNT_CAP) {
        this.__reconnectAttempts += 1;
      }
    } else {
      this.__reconnectAttempts = 1;
    }

    // Compute actual reconnect delay (taking into account reconnect attempts)
    // Notice: this prevents hitting the server too often with reconnection \
    //   retries in the event of a long downtime. The reconnect attempts count \
    //   is capped to a maximum, to avoid overflowing its number type on \
    //   forever-down clients, and also to avoid obtaining a delay that's too \
    //   high.
    const afterActualDelay = afterBaseDelay * this.__reconnectAttempts;

    // Schedule reconnect
    this.__reconnectTimeout = setTimeout(async () => {
      delete this.__reconnectTimeout;

      try {
        logger.info("Reconnecting now…");

        await this.__connect(credentials.jid, credentials.password);
      } catch (error) {
        // Ignore reconnection errors here
        logger.warn("Could not reconnect client", error);
      }
    }, afterActualDelay);

    logger.debug(`Scheduled reconnect attempt in ${afterActualDelay}ms`);
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
    // Update global markers
    Store.$session.setConnected(true);
    Store.$session.setConnecting(false);

    // Clear reconnect attempts
    this.__reconnectAttempts = 0;
  }

  private __onClientDisconnected(): void {
    // Update global markers
    Store.$session.setConnected(false);
    Store.$session.setConnecting(false);

    // Schedule next reconnect? (still authenticated)
    if (this.__credentials) {
      this.reconnect(RECONNECT_INTERVAL);
    }
  }

  private async __connect(jid: JID, password: string): Promise<void> {
    // Mark as connecting
    Store.$session.setConnecting(true);

    // Initialize client? (or re-use existing client)
    if (this.client === undefined) {
      this.client = await ProseClient.init(
        new BrokerConnection(),
        this.__delegate,
        new EncryptionService(),
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
