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
import mitt from "mitt";

// PROJECT: STORES
import Store from "@/store";
import { fromCoreMessage as inboxMessageFromCore } from "@/store/tables/inbox";

// PROJECT: UTILITIES
import { AudioSound, default as UtilitiesAudio } from "@/utilities/audio";
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerDelegate implements ProseClientDelegate {
  private __eventBus = mitt();

  events(): ReturnType<typeof mitt> {
    return this.__eventBus;
  }

  clientConnected(): void {
    logger.info("Client connected");

    this.__eventBus.emit("client:connected");
  }

  clientDisconnected(_client: ProseClient, error?: ConnectionError): void {
    if (error) {
      const message = "message" in error ? error.message : "<no message>";

      logger.warn(`Client disconnected. Reason: ${error.code}. ${message}`);
    } else {
      logger.info(`Client disconnected`);
    }

    this.__eventBus.emit("client:disconnected");
  }

  async composingUsersChanged(_client: ProseClient, room: Room): Promise<void> {
    const composingUsers = await room.loadComposingUsers();

    logger.info(
      `Composing users changed: ${
        composingUsers.map(user => user.jid).join(", ") || "(none)"
      }`
    );

    Store.$inbox.setComposing(room.id, composingUsers);
  }

  async sidebarChanged(): Promise<void> {
    logger.info("Sidebar changed");

    Store.$room.markRoomsChanged();
  }

  roomAttributesChanged(_client: ProseClient, room: Room): void {
    logger.info(`Room attributes changed in: ${room.id}`);

    Store.$room.updateRoom(room.id, room);
  }

  roomParticipantsChanged(_client: ProseClient, room: Room): void {
    logger.info(`Room participants changed in: ${room.id}`);

    Store.$room.updateRoom(room.id, room);
  }

  contactChanged(_client: ProseClient, jids: Array<JID>): void {
    logger.info(`Contacts changed: ${jids.join(", ")}`);

    if (jids.length > 0) {
      Store.$roster.markContactsChanged();
    }
  }

  contactListChanged(): void {
    logger.info("Contact list changed");

    Store.$roster.markContactsChanged();
  }

  blockListChanged(): void {
    logger.info("Block list changed");

    Store.$roster.markBlockListChanged();
  }

  presenceSubscriptionRequestsChanged(): void {
    logger.info("Presence subscription requests changed");

    Store.$presence.marRequestsChanged();
  }

  avatarChanged(_client: ProseClient, jids: Array<JID>): void {
    logger.info(`Avatars changed: ${jids.join(", ")}`);

    jids.forEach(jid => {
      Store.$avatar.load(jid);
    });
  }

  async accountInfoChanged(): Promise<void> {
    logger.info("Account information changed");

    await Store.$account.loadInformation(true);
  }

  async messagesAppended(
    _client: ProseClient,
    room: Room,
    messageIDs: string[]
  ): Promise<void> {
    logger.info(
      `Messages appended in room: ${
        room.id
      } with identifiers: ${messageIDs.join(", ")}`
    );

    const messages = await room.loadMessagesWithIDs(messageIDs);

    // Insert all appended messages
    const hasInserted = Store.$inbox.insertCoreMessages(room, messages);

    // Play incoming message sound? (only for messages from remote users)
    if (hasInserted === true) {
      // Check if notifications are paused or not
      const hasNotifications =
        Store.$settings.notifications.action.notify.sound === true &&
        (Store.$settings.notifications.pause.until || 0) <= Date.now();

      if (hasNotifications === true) {
        const selfJIDString = Store.$account.getSelfJID().toString();

        const firstNonSelfMessage = messages.find(message => {
          return message.from !== selfJIDString;
        });

        if (firstNonSelfMessage) {
          UtilitiesAudio.play(AudioSound.AlertMessageReceive);
        }
      }
    }
  }

  messagesDeleted(
    _client: ProseClient,
    room: Room,
    messageIDs: string[]
  ): void {
    logger.info(
      `Messages deleted in room: ${room.id} with identifiers: ${messageIDs.join(
        ", "
      )}`
    );

    for (const messageID of messageIDs) {
      Store.$inbox.retractMessage(room.id, messageID);
    }
  }

  async messagesUpdated(
    _client: ProseClient,
    room: Room,
    messageIDs: string[]
  ): Promise<void> {
    logger.info(
      `Messages updated in room: ${room.id} with identifiers: ${messageIDs.join(
        ", "
      )}`
    );

    const messages = await room.loadMessagesWithIDs(messageIDs);

    for (const message of messages) {
      if (!message.id) {
        continue;
      }

      Store.$inbox.updateMessage(
        room.id,
        message.id,
        inboxMessageFromCore(room, message)
      );
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerDelegate;
