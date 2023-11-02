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
import { default as UtilitiesAudio, AudioSound } from "@/utilities/audio";

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

  async composingUsersChanged(_client: ProseClient, room: Room): Promise<void> {
    const composingUsers = await room.loadComposingUsers();

    logger.info(
      `Composing users changed: ${composingUsers.join(", ") || "(none)"}`
    );

    Store.$inbox.setComposing(room.id, composingUsers);
  }

  roomsChanged(): void {
    Store.$muc.markRoomsChanged();
    Store.$muc.load();
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

    // Insert all appended messages
    const hasInserted = Store.$inbox.insertCoreMessages(room.id, messages);

    // Play incoming message sound? (only for messages from remote users)
    if (
      hasInserted === true &&
      Store.$settings.notifications.action.notify.sound === true
    ) {
      const selfJIDRaw = Store.$account.getLocalJID().toString();

      const firstNonSelfMessage = messages.find(message => {
        return message.from !== selfJIDRaw;
      });

      if (firstNonSelfMessage) {
        UtilitiesAudio.play(AudioSound.AlertMessageReceive);
      }
    }
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
    _client: ProseClient,
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
