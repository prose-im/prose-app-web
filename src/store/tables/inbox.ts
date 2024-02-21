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
  UserBasicInfo as CoreUser,
  ArchiveID,
  Room,
  RoomID,
  RoomType
} from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
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

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type InboxEntryMessages = {
  list: Array<InboxEntryMessage>;
  byId: { [id: string]: InboxEntryMessage };
};

type InboxEntryNames = {
  byFrom: { [from: string]: InboxEntryName };
};

type InboxEntryName = {
  from: string;
  name: string;
  origin: InboxNameOrigin;
};

type InboxEntryStates = {
  composing: Array<CoreUser>;
};

type EventMessageGeneric = {
  roomId: RoomID;
  message: InboxEntryMessage;
  original?: InboxEntryMessage;
};

type EventNameGeneric = {
  roomId: RoomID;
  from: string;
  name: string;
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
  archiveId?: ArchiveID;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

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
    from: message.user.jid,
    content: message.content,

    // Metas
    metas: {
      secure: room.type === RoomType.PublicChannel,
      encrypted: false,
      edited: message.meta.isEdited
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
        authors: reaction.authors.map(jid => jid.toString())
      };
    })
  };
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
              byFrom: {}
            },

            states: {
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

    getNames(roomId: RoomID): { [from: string]: InboxEntryName } {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(roomId).names.byFrom;
    },

    getStates(roomId: RoomID): InboxEntryStates {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(roomId).states;
    },

    insertCoreMessages(room: Room, messages: CoreMessage[]): boolean {
      let hasInserted = false;

      messages.forEach(message => {
        // Update sender names contained into message
        this.setName(
          room.id,
          message.user.jid,
          message.user.name,
          InboxNameOrigin.Message
        );

        // Insert messages
        // Notice: update inserted marker if this message was inserted.
        if (
          this.insertMessage(room.id, fromCoreMessage(room, message)) === true
        ) {
          hasInserted = true;
        }
      });

      return hasInserted;
    },

    insertMessage(roomId: RoomID, message: InboxEntryMessage): boolean {
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
          container.list.push(message);
        });

        // Emit IPC inserted event
        EventBus.emit("message:inserted", {
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

    setName(
      roomId: RoomID,
      from: string,
      name: string,
      origin: InboxNameOrigin
    ): boolean {
      const container = this.assert(roomId).names.byFrom;

      // Check if should change name
      let shouldChange = false;

      const existingName = container[from];

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
        if (!container[from]) {
          container[from] = {
            from,
            name,
            origin
          };
        } else {
          container[from].name = name;
          container[from].origin = origin;
        }

        // Emit IPC changed event
        EventBus.emit("name:changed", {
          roomId: roomId,
          from,
          name
        } as EventNameGeneric);
      }

      return shouldChange;
    },

    setComposing(roomId: RoomID, composing: Array<CoreUser>): void {
      // Filter-out local JID in the list of composing users
      const selfJID = Store.$account.getSelfJID();

      this.assert(roomId).states.composing = composing.filter(user => {
        return !user.jid.equals(selfJID);
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { InboxNameOrigin, fromCoreMessage };
export type {
  EventMessageGeneric,
  EventNameGeneric,
  InboxEntryMessage,
  InboxEntryName
};
export default $inbox;
