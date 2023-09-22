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
  ConnectionError,
  JID,
  ProseClient,
  ProseClientDelegate,
  Room
} from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";
import { fromCoreMessage as inboxMessageFromCore } from "@/store/tables/inbox";

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

  async composingUsersChanged(client: ProseClient, room: Room): Promise<void> {
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

  roomsChanged(_client: ProseClient): void {
    Store.$roster.markRoomsChanged();
  }

  contactChanged(_client: ProseClient, jid: JID): void {
    Store.$roster.markContactChanged(jid);
  }

  avatarChanged(_client: ProseClient, jid: JID): void {
    Store.$avatar.load(jid);
  }

  async messagesAppended(
    _client: ProseClient,
    room: Room,
    messageIDs: string[]
  ): Promise<void> {
    const messages = await room.loadMessagesWithIDs(messageIDs);
    Store.$inbox.insertCoreMessages(room.id, messages);
  }

  messagesDeleted(
    _client: ProseClient,
    room: Room,
    messageIDs: string[]
  ): void {
    for (const messageID of messageIDs) {
      Store.$inbox.retractMessage(room.id, messageID);
    }
  }

  async messagesUpdated(
    client: ProseClient,
    room: Room,
    messageIDs: string[]
  ): Promise<void> {
    const messages = await room.loadMessagesWithIDs(messageIDs);

    for (const message of messages) {
      if (!message.id) {
        continue;
      }

      Store.$inbox.updateMessage(
        room.id,
        message.id,
        inboxMessageFromCore(message)
      );
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerDelegate;
