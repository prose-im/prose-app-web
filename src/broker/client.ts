/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, ProseClient, ProseClientConfig } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

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

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerClient {
  jid?: JID;
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
      throw new Error("Another connection already exist");
    }

    // Store credentials
    this.__credentials = {
      jid,
      password
    };

    // Setup context
    this.jid = this.__credentials?.jid;

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
    this.__reconnectTimeout = setTimeout(() => {
      delete this.__reconnectTimeout;

      logger.debug("Reconnecting now…");

      this.__connect(credentials.jid, credentials.password);
    }, afterDelay);
  }

  async observe(): Promise<void> {
    await Broker.$room.startObservingRooms();
  }

  async logout(): Promise<void> {
    // Unassign JID
    this.jid = undefined;

    // Void stored credentials
    this.__credentials = undefined;

    await this.client?.disconnect();
    await this.client?.deleteCachedData();
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

    // Initialize client
    const client = await ProseClient.init(
      new BrokerConnection(),
      this.__delegate,
      this.__configuration()
    );

    this.client = client;

    // Connect client
    try {
      await client.connect(jid, password);
    } catch (error) {
      logger.error("Something went wrong", error);
    }
  }

  private __configuration(): ProseClientConfig {
    const config = new ProseClientConfig();

    // Configure connection
    config.pingInterval = PING_INTERVAL_SECONDS;
    config.logReceivedStanzas = true;
    config.logSentStanzas = true;

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
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerClient;
