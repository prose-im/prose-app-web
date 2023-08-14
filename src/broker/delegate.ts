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
  JID
} from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: BROKER
import mitt from "mitt";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerDelegate implements ProseClientDelegate {
  private __eventBus = mitt();

  events(): ReturnType<typeof mitt> {
    return this.__eventBus;
  }

  clientConnected(): void {
    this.__eventBus.emit("client:connected");
  }

  clientDisconnected(_client: ProseClient, error?: ConnectionError): void {
    if (error) {
      const message = "message" in error ? error.message : "<no message>";

      logger.warn(`Client disconnected. Reason: ${error.code}. ${message}`);
    }

    this.__eventBus.emit("client:disconnected");
  }

  async composingUsersChanged(
    client: ProseClient,
    conversation: JID
  ): Promise<void> {
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

  contactChanged(_client: ProseClient, jid: JID): void {
    Store.$roster.emitContactChanged(jid);
  }

  avatarChanged(_client: ProseClient, jid: JID): void {
    Store.$avatar.load(jid);
  }

  async messagesAppended(
    client: ProseClient,
    conversation: JID,
    messageIDs: string[]
  ): Promise<void> {
    const messages = await client.loadMessagesWithIDs(conversation, messageIDs);

    Store.$inbox.insertMessages(conversation, messages);
  }

  messagesDeleted(
    _client: ProseClient,
    conversation: JID,
    messageIDs: string[]
  ): void {
    for (const messageID of messageIDs) {
      Store.$inbox.retractMessage(conversation, messageID);
    }
  }

  async messagesUpdated(
    client: ProseClient,
    conversation: JID,
    messageIDs: string[]
  ): Promise<void> {
    const messages = await client.loadMessagesWithIDs(conversation, messageIDs);

    for (const message of messages) {
      Store.$inbox.updateMessage(conversation, message.id, message);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerDelegate;
