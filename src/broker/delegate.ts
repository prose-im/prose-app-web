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
  Room,
  Availability
} from "@prose-im/prose-sdk-js";
import mitt from "mitt";

// PROJECT: STORES
import Store from "@/store";
import {
  fromCoreMessage as inboxMessageFromCore,
  InboxInsertMode
} from "@/store/tables/inbox";

// PROJECT: UTILITIES
import UtilitiesContext from "@/utilities/context";
import { AudioSound, default as UtilitiesAudio } from "@/utilities/audio";
import UtilitiesRuntime from "@/utilities/runtime";
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

    // Reset internal states
    Store.$inbox.markResetStates();

    this.__eventBus.emit("client:disconnected");
  }

  async composingUsersChanged(_client: ProseClient, room: Room): Promise<void> {
    const composingUsers = await room.loadComposingUsers();

    logger.info(
      `Composing users changed: ${
        composingUsers.map(user => user.id).join(", ") || "(none)"
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
  }

  async accountInfoChanged(): Promise<void> {
    logger.info("Account information changed");

    await Store.$account.loadInformation(true);
  }

  async workspaceIconChanged(): Promise<void> {
    logger.info("Workspace icon changed");

    await Store.$account.loadWorkspace(true);
  }

  async workspaceInfoChanged(): Promise<void> {
    logger.info("Workspace information changed");

    await Store.$account.loadWorkspace(true);
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

    // Load messages corresponding to identifiers
    const messages = await room.loadMessagesWithIDs(messageIDs);

    // Insert all appended messages (in insert mode since messages got appended)
    const hasInserted = Store.$inbox.insertCoreMessages(
      room,
      messages,
      InboxInsertMode.Insert
    );

    // Trigger a notification? (only for messages from remote users)
    if (hasInserted === true) {
      const selfJIDString = Store.$account.getSelfJID().toString(),
        selfAvailability = Store.$account.getInformationAvailability();

      // Get first message that's not from self
      const firstNonSelfMessage = messages.find(message => {
        return message.from !== selfJIDString;
      });

      // Check if user can be notified
      const hasNotifications =
        UtilitiesContext.areMessageNotificationsPermitted(
          room,
          firstNonSelfMessage
        );

      // Play incoming message sound? (check if sounds are allowed or not)
      // Notice: do not play if user is in DND mode (should mute audible alerts)
      if (
        hasNotifications === true &&
        selfAvailability !== Availability.DoNotDisturb &&
        Store.$settings.notifications.action.notify.sound === true
      ) {
        UtilitiesAudio.play(AudioSound.AlertMessageReceive);
      }

      // Send incoming message banner? (check if banners are allowed or not)
      if (
        hasNotifications === true &&
        Store.$settings.notifications.action.notify.banner === true
      ) {
        // Check if should force notification, since currently open room, \
        //   if any, does not match message room identifier.
        const shouldForce =
          Store.$history.current.name !== "app.inbox" ||
          Store.$history.current.params.roomId !== room.id;

        messages.forEach(message => {
          if (message.from !== selfJIDString) {
            // Request to send notification
            // Notice: set sender name as subtitle (if different from room name)
            UtilitiesRuntime.requestNotificationSend(
              room.name,
              message.rawContent,

              {
                force: shouldForce,

                subtitle:
                  message.user.name !== room.name
                    ? message.user.name
                    : undefined,

                route: {
                  name: "app.inbox",

                  params: {
                    roomId: room.id
                  }
                }
              }
            );
          }
        });
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

  messagesNeedReload(_client: ProseClient, room: Room): void {
    logger.info(`Messages need reload in room: ${room.id}`);

    Store.$inbox.markMessagesReload(room.id);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerDelegate;
