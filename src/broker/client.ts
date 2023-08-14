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
  ProseClient,
  ProseClientDelegate,
  ConnectionError,
  Availability,
  ProseClientConfig,
  JID
} from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: BROKER
import mitt from "mitt";
import { JSConnectionProvider } from "./connection";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const RECONNECT_INTERVAL = 5000; // 5 seconds

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerClient {
  jid?: JID;
  client?: ProseClient;

  private __delegate: ClientDelegate;
  private __credentials?: { jid: JID; password: string };
  private __reconnectTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    // Initialize delegate
    this.__delegate = new ClientDelegate();

    this.__delegate
      .events()
      .on("client:connected", () => this.__onClientConnected());
    this.__delegate
      .events()
      .on("client:disconnected", () => this.__onClientDisconnected());
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

  async logout(): Promise<void> {
    // Unassign JID
    this.jid = undefined;

    // Void stored credentials
    this.__credentials = undefined;

    await this.client?.disconnect();
    await this.client?.deleteCachedData();
  }

  private __onClientConnected() {
    Store.$session.setConnected(true);
    Store.$session.setConnecting(false);
  }

  private __onClientDisconnected() {
    Store.$session.setConnected(false);
    Store.$session.setConnecting(false);

    if (!this.__credentials) {
      return;
    }

    this.reconnect(RECONNECT_INTERVAL);
  }

  private async __connect(jid: JID, password: string): Promise<void> {
    Store.$session.setConnecting(true);

    // Initialize client configuration
    const config = new ProseClientConfig();

    config.pingInterval = 60;
    config.logReceivedStanzas = true;
    config.logSentStanzas = true;

    // Initialize client
    const client = await ProseClient.init(
      new JSConnectionProvider(),
      this.__delegate,
      config
    );

    this.client = client;

    // Connect client
    try {
      await client.connect(jid, password, Availability.Available);
    } catch (error) {
      logger.error("Something went wrong", error);
    }
  }

  private __cancelScheduledReconnectTimer(): void {
    if (this.__reconnectTimeout !== undefined) {
      clearTimeout(this.__reconnectTimeout);
    }
  }
}

// TODO: can this be located somewhere else?
class ClientDelegate implements ProseClientDelegate {
  private __eventBus = mitt();

  events(): ReturnType<typeof mitt> {
    return this.__eventBus;
  }

  clientConnected() {
    this.__eventBus.emit("client:connected");
  }

  clientDisconnected(_client: ProseClient, error?: ConnectionError) {
    if (error) {
      const message = "message" in error ? error.message : "<no message>";

      logger.warn(`Client disconnected. Reason: ${error.code}. ${message}`);
    }

    this.__eventBus.emit("client:disconnected");
  }

  async composingUsersChanged(client: ProseClient, conversation: JID) {
    const composingUsers = await client.loadComposingUsersInConversation(
      conversation
    );

    logger.info(
      `Composing users changed: ${composingUsers.join(", ") || "(none)"}`
    );

    const conversationComposingUser = composingUsers.find(jid => {
      return jid.equals(conversation);
    });

    Store.$inbox.setComposing(
      conversation,
      conversationComposingUser ? true : false
    );
  }

  contactChanged(_client: ProseClient, jid: JID) {
    Store.$roster.emitContactChanged(jid);
  }

  avatarChanged(_client: ProseClient, jid: JID): void {
    Store.$avatar.load(jid);
  }

  async messagesAppended(
    client: ProseClient,
    conversation: JID,
    messageIDs: string[]
  ) {
    const messages = await client.loadMessagesWithIDs(conversation, messageIDs);

    Store.$inbox.insertMessages(conversation, messages);
  }

  messagesDeleted(
    _client: ProseClient,
    conversation: JID,
    messageIDs: string[]
  ) {
    for (const messageID of messageIDs) {
      Store.$inbox.retractMessage(conversation, messageID);
    }
  }

  async messagesUpdated(
    client: ProseClient,
    conversation: JID,
    messageIDs: string[]
  ) {
    const messages = await client.loadMessagesWithIDs(conversation, messageIDs);

    for (const message of messages) {
      Store.$inbox.updateMessage(conversation, message.id, message);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerClient;
