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
  JID
} from "@prose-im/prose-core-client-wasm";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface ConnectLifecycle {
  success: (value: void) => void;
  failure: (error: Error) => void;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const REQUEST_TIMEOUT_DEFAULT = 10000; // 10 seconds

const RECONNECT_INTERVAL = 5000; // 5 seconds

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerClient implements ProseClientDelegate {
  jid?: JID;

  client?: ProseClient;

  private __connectLifecycle?: ConnectLifecycle;
  private __credentials?: { jid: JID; password: string };
  private __reconnectTimeout?: ReturnType<typeof setTimeout>;

  async authenticate(jid: JID, password: string): Promise<void> {
    // Incomplete parameters?
    if (!password) {
      throw new Error("Please provide a password");
    }

    // Another connection pending?
    if (this.__connectLifecycle) {
      throw new Error("Another connection is pending");
    }

    // Another connection active?
    if (this.__connection) {
      throw new Error("Another connection already exist");
    }

    // Store credentials
    this.__credentials = {
      jid,
      password
    };

    const client = await ProseClient.init(this);
    this.client = client;

    try {
      await client.connect(jid, password, Availability.Available);
    } catch (error) {
      console.log("Something went wrong", error);
      this.__clearContext();
      return;
    }

    // Setup context
    this.jid = this.__credentials?.jid;

    Store.$session.setConnected(true);
    Store.$session.setConnecting(false);
  }

  reconnect(afterDelay = 0): void {
    const credentials = this.__credentials;

    if (credentials === undefined) {
      throw new Error("Cannot reconnect: credentials are not set");
    }
    if (this.__connection !== undefined) {
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
    await this.client?.disconnect();
    await this.client?.deleteCachedData();
  }

  private __clearContext(): void {
    // Mark as disconnected (this is permanent)
    Store.$session.setConnected(false);
    Store.$session.setConnecting(false);
    Store.$session.setProtocol("");

    // Unassign JID
    this.jid = undefined;

    // Void stored credentials
    this.__credentials = undefined;
  }

  private __cancelScheduledReconnectTimer(): void {
    if (this.__reconnectTimeout !== undefined) {
      clearTimeout(this.__reconnectTimeout);
    }
  }

  clientConnected() {
    console.log("Client connected");
  }

  clientDisconnected(error?: ConnectionError) {
    console.log("Client disconnected");
  }

  async composingUsersChanged(conversation: JID) {
    console.log("Composing users changed");
    let composingUsers =
      (await this.client?.loadComposingUsersInConversation(conversation)) || [];
    Store.$inbox.setComposing(
      conversation,
      composingUsers.find(jid => jid.equals(conversation))
    );
  }

  contactChanged(jid: JID) {
    Store.$roster.emitContactChanged(jid);
  }

  avatarChanged(jid: JID): void {
    Store.$avatar.load(jid);
  }

  async messagesAppended(conversation: JID, messageIDs: string[]) {
    let messages =
      (await this.client?.loadMessagesWithIDs(conversation, messageIDs)) || [];
    Store.$inbox.insertMessages(conversation, messages);
  }

  messagesDeleted(conversation: JID, messageIDs: string[]) {
    for (const messageID of messageIDs) {
      Store.$inbox.retractMessage(conversation, messageID);
    }
  }

  async messagesUpdated(conversation: JID, messageIDs: string[]) {
    const messages =
      (await this.client?.loadMessagesWithIDs(conversation, messageIDs)) || [];
    for (const message of messages) {
      Store.$inbox.updateMessage(conversation, message.id, message);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerClient;
