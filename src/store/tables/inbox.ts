/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import mitt from "mitt";
import { defineStore } from "pinia";
import { MessagingStoreMessageData } from "@prose-im/prose-core-views/types/messaging";
import {
  Message as CoreMessage,
  ParticipantBasicInfo as CoreParticipantBasicInfo,
  ArchiveID,
  Room,
  RoomID,
  RoomType
} from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import UtilitiesFile from "@/utilities/file";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum InboxNameOrigin {
  // Global origin.
  Global = "global",
  // Message origin.
  Message = "message"
}

enum InboxInsertMode {
  // Insert mode.
  Insert = "insert",
  // Restore mode.
  Restore = "restore"
}

enum InboxArchivesAcquiredMode {
  // Up-to-date mode.
  UpToDate = "up-to-date",
  // Stale mode.
  Stale = "stale"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type InboxEntryMessages = {
  list: Array<InboxEntryMessage>;
  byId: { [id: string]: InboxEntryMessage };
};

type InboxEntryNames = {
  byUserId: { [userId: string]: InboxEntryName };
};

type InboxEntryName = {
  userId: string;
  name: string;
  origin: InboxNameOrigin;
};

type InboxEntryStates = {
  archives: InboxEntryStateArchives;
  loading: InboxEntryStateLoading;
  composing: Array<CoreParticipantBasicInfo>;
};

type EventMessagesGeneric = {
  roomId: RoomID;
};

type EventMessageGeneric = {
  roomId: RoomID;
  message: InboxEntryMessage;
  original?: InboxEntryMessage;
};

type EventNameGeneric = {
  roomId: RoomID;
  userId: string;
  name: string;
};

type EventStateLoadingGeneric = {
  roomId: RoomID;
  loading: InboxEntryStateLoading;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Inbox {
  entries: InboxEntries;
}

interface InboxEntries {
  [roomId: string]: InboxEntry;
}

interface InboxEntry {
  messages: InboxEntryMessages;
  names: InboxEntryNames;
  states: InboxEntryStates;
}

interface InboxEntryMessage extends MessagingStoreMessageData {
  timestamp: number;
  archiveId?: ArchiveID;
}

interface InboxEntryStateArchives {
  acquiredAt?: number;
  lastArchiveId?: ArchiveID;
}

interface InboxEntryStateLoading {
  backwards?: boolean;
  forwards?: boolean;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const CORE_MESSAGE_CONTENT_ENCODING = "html";

/**************************************************************************
 * METHODS
 * ************************************************************************* */

const fromCoreMessage = function (
  room: Room,
  message: CoreMessage
): InboxEntryMessage {
  // Generate inbox message from core message
  // Notice: public channel messages are considered as secure even if not \
  //   encrypted.
  return {
    id: message.id,
    archiveId: message.archiveId,
    type: message.type,
    date: message.date.toISOString(),
    timestamp: message.date.getTime(),
    from: message.user.jid,
    content: message.rawContent,

    // Formatted content
    formatted: {
      encoding: CORE_MESSAGE_CONTENT_ENCODING,
      content: message.content
    },

    // Metas
    metas: {
      secure: message.meta.isEncrypted || room.type === RoomType.PublicChannel,
      encrypted: message.meta.isEncrypted,
      edited: message.meta.isEdited,
      transient: message.meta.isTransient,
      lastRead: message.meta.isLastRead
    },

    // File attachments (if any)
    files: message.attachments.map(attachment => {
      // Detect file attributes from URL (as a fallback, if not enough data)
      const fileAttributes = UtilitiesFile.detectAttributesFromUrl(
        attachment.url
      );

      return {
        // Common attributes
        name: attachment.fileName || fileAttributes.name,
        type: attachment.mediaType || fileAttributes.mimeGuess,
        url: attachment.url,

        preview: {
          // Thumbnail URL (images & videos)
          url: attachment.thumbnail?.url,

          // Thumbnail Size (images & videos)
          size:
            attachment.thumbnail?.width && attachment.thumbnail?.height
              ? {
                  width: attachment.thumbnail.width,
                  height: attachment.thumbnail.height
                }
              : undefined,

          // Duration (videos & audios)
          duration:
            attachment.duration !== undefined
              ? Number(attachment.duration)
              : undefined
        }
      };
    }),

    // Reactions (if any)
    reactions: message.reactions.map(reaction => {
      return {
        reaction: reaction.reaction,
        authors: reaction.authors.map(author => author.jid.toString())
      };
    })
  };
};

const detectInsertMode = function (
  container: InboxEntryMessages,
  messages: Array<CoreMessage>
): InboxInsertMode {
  const storeMessages = container.list;

  if (messages.length > 0 && storeMessages.length > 0) {
    // Exclude messages to insert that hold the same identifiers as messages \
    //   in store
    const storeMessageIds = new Set(
      storeMessages
        .map(storeMessage => storeMessage.id)
        .filter(id => id !== undefined)
    );

    const insertMessages = messages.filter(message => {
      return storeMessageIds.has(message.id) === false;
    });

    if (insertMessages.length > 0) {
      // Acquire messages at boundaries
      const firstStoreMessageTime = storeMessages[0].timestamp,
        lastStoreMessageTime =
          storeMessages[storeMessages.length - 1].timestamp;

      const firstInsertMessageTime = insertMessages[0].date.getTime(),
        lastInsertMessageTime =
          insertMessages[insertMessages.length - 1].date.getTime();

      // Notice: this compares the last store message date with the first \
      //   message date. If the last store message is more recent than \
      //   the first message to be inserted, then it means the whole block \
      //   of messages to insert should be prepended BEFORE existing messages. \
      //   This is required if there are already messages in the store, that \
      //   could be more recent than those messages, eg. if a new message was \
      //   received in-band and the room is opened later.
      if (firstInsertMessageTime >= lastStoreMessageTime) {
        // Use insert mode
        return InboxInsertMode.Insert;
      }

      if (lastInsertMessageTime < firstStoreMessageTime) {
        // Use restore mode
        return InboxInsertMode.Restore;
      }
    }
  }

  // Use insert mode (default)
  return InboxInsertMode.Insert;
};

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $inbox = defineStore("inbox", {
  persist: false,

  state: (): Inbox => {
    return {
      entries: {}
    };
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    assert(roomId: RoomID): InboxEntry {
      const entries = this.entries;

      // Assign new inbox entry?
      if (!(roomId in entries)) {
        this.$patch(() => {
          // Insert with defaults
          entries[roomId] = {
            messages: {
              list: [],
              byId: {}
            },

            names: {
              byUserId: {}
            },

            states: {
              archives: {},
              loading: {},
              composing: []
            }
          };
        });
      }

      return entries[roomId];
    },

    flush(roomId: RoomID): boolean {
      const entries = this.entries;

      // Flush inbox entry?
      if (roomId in entries) {
        delete entries[roomId];

        // Flushed
        return true;
      }

      // Not flushed
      return false;
    },

    getRooms(): Array<RoomID> {
      // Notice: no need to alias 'string' to 'RoomID' for each entry here, as \
      //   'RoomID' is already string-like.
      return Object.keys(this.entries);
    },

    getMessages(roomId: RoomID): Array<InboxEntryMessage> {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(roomId).messages.list;
    },

    getMessage(roomId: RoomID, id: string): InboxEntryMessage | void {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(roomId).messages.byId[id] || undefined;
    },

    getNames(roomId: RoomID): { [userId: string]: InboxEntryName } {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(roomId).names.byUserId;
    },

    getStates(roomId: RoomID): InboxEntryStates {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(roomId).states;
    },

    insertCoreMessages(
      room: Room,
      messages: Array<CoreMessage>,
      mode?: InboxInsertMode
    ): boolean {
      const container = this.assert(room.id).messages;

      // Define common insert markers
      let hasInserted = false,
        lastInsertError: Error | null = null;

      // Automatically decide on the insert mode? (if none provided)
      if (mode === undefined) {
        mode = detectInsertMode(container, messages);
      }

      // Insert or restore messages (forwards or backwards)
      // Notice: instead of allocating a new Array by using the simple \
      //   'Array.slice().reverse()' method, rather use zero-cost forward or \
      //   backward loops, at the expense of more complex code.
      if (mode === InboxInsertMode.Restore) {
        for (let i = messages.length - 1; i >= 0; i--) {
          try {
            hasInserted =
              this.insertCoreMessage(room, messages[i], mode) || hasInserted;
          } catch (error) {
            lastInsertError = (error || new Error("Restore error")) as Error;

            logger.error(
              `Failed restoring individual core message in room: ${room.id}`,
              error
            );
          }
        }
      } else {
        for (let i = 0; i < messages.length; i++) {
          try {
            hasInserted =
              this.insertCoreMessage(room, messages[i], mode) || hasInserted;
          } catch (error) {
            lastInsertError = (error || new Error("Insert error")) as Error;

            logger.error(
              `Failed inserting individual core message in room: ${room.id}`,
              error
            );
          }
        }
      }

      // Nothing inserted, and caught an insertion error? Throw immediately.
      // Notice: do not throw if there is at least 1 successful insertion, \
      //   even if we caught an insertion error, since it might prevent \
      //   inserting a whole list of valid messages — we want to be lenient \
      //   here.
      if (hasInserted !== true && lastInsertError !== null) {
        throw lastInsertError;
      }

      return hasInserted;
    },

    insertCoreMessage(
      room: Room,
      message: CoreMessage,
      mode = InboxInsertMode.Insert
    ): boolean {
      // Update sender names (contained into message)
      this.setName(
        room.id,
        message.user.jid,
        message.user.name,
        InboxNameOrigin.Message
      );

      // Update sender avatar (contained into message)
      // Notice: this is a cross-store operation, for convenience.
      if (message.user.avatar !== undefined) {
        Store.$avatar.refresh(message.user.jid.toString(), message.user.avatar);
      }

      // Insert actual message
      return this.insertMessage(room.id, fromCoreMessage(room, message), mode);
    },

    insertMessage(
      roomId: RoomID,
      message: InboxEntryMessage,
      mode = InboxInsertMode.Insert
    ): boolean {
      const container = this.assert(roomId).messages;

      // Acquire message identifier
      const messageId = message.id;

      if (!messageId) {
        throw new Error("Cannot insert a message with no identifier");
      }

      // Attempt to update first?
      const wasUpdated = this.updateMessage(roomId, messageId, message);

      // Should insert message? (does not exist)
      if (wasUpdated !== true) {
        // Insert message in its container
        this.$patch(() => {
          container.byId[messageId] = message;

          if (mode === InboxInsertMode.Restore) {
            container.list.unshift(message);
          } else {
            container.list.push(message);
          }
        });

        // Emit IPC event (restored or inserted)
        const eventName =
          mode === InboxInsertMode.Restore
            ? "message:restored"
            : "message:inserted";

        EventBus.emit(eventName, {
          roomId: roomId,
          message
        } as EventMessageGeneric);

        // Mark as inserted
        return true;
      }

      // Mark as not inserted
      return false;
    },

    updateMessage(
      roomId: RoomID,
      id: string,
      message: InboxEntryMessage
    ): boolean {
      const container = this.assert(roomId).messages;

      // Acquire message identifier
      const messageId = message.id;

      if (!messageId) {
        throw new Error("Cannot update a message with no identifier");
      }

      // Assert message (update only if a previous message exists)
      // Notice: only update message if it exists in storage, by updating the \
      //   whole message entry, instead of using 'Object.assign()', which is \
      //   known to cause issues due to wasm-bindgen pointers once they get \
      //   garbage-collected. We want to replace the whole Message object with \
      //   the new one, which may contain new memory references.
      const originalMessage = container.byId[id] || null;

      if (originalMessage !== null) {
        // Find original message at index in list
        const originalMessageIndex = container.list.findIndex(foundMessage => {
          return id === foundMessage.id;
        });

        this.$patch(() => {
          // Delete existing message at previous identifier? (only if \
          //   message identifier has changed)
          if (messageId !== id) {
            delete container.byId[id];
          }

          // Store existing message at new identifier (or replace if \
          //   identifier has not changed)
          container.byId[messageId] = message;

          // Update message in list at index? (if any, should always find one)
          if (originalMessageIndex > -1) {
            container.list[originalMessageIndex] = message;
          }
        });

        // Emit IPC updated event
        EventBus.emit("message:updated", {
          roomId: roomId,
          message: message,
          original: originalMessage
        } as EventMessageGeneric);

        // Mark as updated
        return true;
      }

      // Mark as non-updated
      return false;
    },

    retractMessage(roomId: RoomID, id: string): boolean {
      const container = this.assert(roomId).messages;

      // Acquire message from store
      const existingMessage = container.byId[id] || null;

      if (existingMessage !== null) {
        // Remove from identifier map
        this.$patch(() => {
          delete container.byId[id];
        });

        // Remove from list
        const listIndex = container.list.findIndex(message => {
          return message.id === id ? true : false;
        });

        if (listIndex > -1) {
          this.$patch(() => {
            container.list.splice(listIndex, 1);
          });
        }

        // Emit IPC retracted event
        EventBus.emit("message:retracted", {
          roomId: roomId,
          message: existingMessage
        } as EventMessageGeneric);

        // Mark as retracted
        return true;
      }

      // Mark as non-retracted
      return false;
    },

    trimMessages(roomId: RoomID, retain: number): boolean {
      const container = this.assert(roomId).messages;

      // Should message list be trimmed? (above retain limit)
      if (container.list.length > retain) {
        const messagesToTrim = container.list.slice(
          0,
          container.list.length - retain
        );

        // Trim messages from their container
        // Notice: fire a single $patch event for all trim passes.
        this.$patch(() => {
          // Trim all messages at once from list
          container.list.splice(0, messagesToTrim.length);

          // Trim individual messages from identifier map
          for (let i = 0; i < messagesToTrim.length; i++) {
            const messageToTrim = messagesToTrim[i];

            // Remove from identifier map? (if message is identified)
            if (
              messageToTrim.id &&
              container.byId[messageToTrim.id] !== undefined
            ) {
              delete container.byId[messageToTrim.id];
            }

            // Emit IPC trimmed event
            EventBus.emit("message:trimmed", {
              roomId: roomId,
              message: messageToTrim
            } as EventMessageGeneric);
          }
        });

        // Update last archive identifier marker?
        // Notice: we need to move the last archive identifier to match the \
        //   now-first message in the container list.
        const lastArchiveId = container.list[0]?.archiveId || null;

        if (lastArchiveId !== null) {
          this.setArchivesLastArchiveId(roomId, lastArchiveId);
        }

        // Mark as trimmed
        return true;
      }

      // Mark as non-trimmed
      return false;
    },

    setName(
      roomId: RoomID,
      userId: string,
      name: string,
      origin: InboxNameOrigin
    ): boolean {
      const container = this.assert(roomId).names.byUserId;

      // Check if should change name
      let shouldChange = false;

      const existingName = container[userId];

      if (!existingName) {
        shouldChange = true;
      } else if (existingName.name !== name) {
        // Only change existing names which old origin is same as origin, or \
        //   if origin is global (which overrides any existing name)
        if (
          origin === InboxNameOrigin.Global ||
          existingName.origin === origin
        ) {
          shouldChange = true;
        }
      }

      // Name should be changed?
      if (shouldChange === true) {
        // Initialize or update?
        if (!container[userId]) {
          container[userId] = {
            userId,
            name,
            origin
          };
        } else {
          container[userId].name = name;
          container[userId].origin = origin;
        }

        // Emit IPC changed event
        EventBus.emit("name:changed", {
          roomId: roomId,
          userId,
          name
        } as EventNameGeneric);
      }

      return shouldChange;
    },

    setComposing(
      roomId: RoomID,
      composing: Array<CoreParticipantBasicInfo>
    ): void {
      const states = this.assert(roomId).states;

      if (composing.length > 0) {
        const room = Store.$room.getRoom(roomId);

        // Filter-out local JID in the list of composing users
        const selfJID = Store.$account.getSelfJID(),
          selfParticipant = room?.participants.find(participant => {
            return participant.jid?.equals(selfJID);
          });

        // Acquire self participant identifier (if any)
        const selfParticipantId = selfParticipant?.id.toString();

        this.$patch(() => {
          states.composing = composing.filter(user => {
            return user.id.toString() !== selfParticipantId;
          });
        });
      } else {
        this.$patch(() => {
          states.composing = [];
        });
      }
    },

    updateLoading(
      roomId: RoomID,
      loadingDifference: InboxEntryStateLoading
    ): boolean {
      const stateLoading = this.assert(roomId).states.loading;

      // Bind updated marker
      let wasUpdated = false;

      // Update loading states
      // Notice: this is a differential update, meaning directions that are \
      //   not there in differential object will not affect the store.
      let direction: keyof InboxEntryStateLoading;

      for (direction in loadingDifference) {
        if (stateLoading[direction] !== loadingDifference[direction]) {
          this.$patch(() => {
            stateLoading[direction] = loadingDifference[direction];
          });

          wasUpdated = true;
        }
      }

      // Emit IPC marked event
      EventBus.emit("state:loading:marked", {
        roomId: roomId,
        loading: stateLoading
      } as EventStateLoadingGeneric);

      return wasUpdated;
    },

    markArchivesAcquired(
      roomId: RoomID,
      mode = InboxArchivesAcquiredMode.UpToDate
    ): void {
      const stateArchives = this.assert(roomId).states.archives;

      this.$patch(() => {
        switch (mode) {
          case InboxArchivesAcquiredMode.UpToDate: {
            stateArchives.acquiredAt = Date.now();

            break;
          }

          case InboxArchivesAcquiredMode.Stale: {
            stateArchives.acquiredAt = undefined;

            break;
          }
        }
      });
    },

    setArchivesLastArchiveId(
      roomId: RoomID,
      lastArchiveId: ArchiveID | void
    ): void {
      const stateArchives = this.assert(roomId).states.archives;

      this.$patch(() => {
        stateArchives.lastArchiveId = lastArchiveId || undefined;
      });
    },

    markResetStates(): void {
      const roomIds = this.getRooms();

      // Clear all composing users in all rooms
      roomIds.forEach(roomId => {
        this.setComposing(roomId, []);
      });
    },

    markMessagesReload(roomId: RoomID): void {
      // Mark archives as stale (since a reload has been requested)
      this.markArchivesAcquired(roomId, InboxArchivesAcquiredMode.Stale);

      // Emit reload request
      EventBus.emit("messages:reload", {
        roomId: roomId
      } as EventMessagesGeneric);
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export {
  InboxNameOrigin,
  InboxInsertMode,
  InboxArchivesAcquiredMode,
  fromCoreMessage
};

export type {
  EventMessagesGeneric,
  EventMessageGeneric,
  EventNameGeneric,
  EventStateLoadingGeneric,
  InboxEntryMessage,
  InboxEntryName,
  InboxEntryStateLoading
};

export default $inbox;
