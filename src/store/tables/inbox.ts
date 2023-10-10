/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { MessagingStoreMessageData } from "@prose-im/prose-core-views/types/messaging";
import { Message as CoreMessage, RoomID } from "@prose-im/prose-sdk-js";
import cloneDeep from "lodash.clonedeep";
import mitt from "mitt";
import { defineStore } from "pinia";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type InboxEntryMessages = {
  list: Array<InboxEntryMessage>;
  byId: { [id: string]: InboxEntryMessage };
};

type InboxEntryStates = {
  composing: boolean;
};

type EventMessageGeneric = {
  roomID: RoomID;
  message: InboxEntryMessage;
  original?: InboxEntryMessage;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Inbox {
  entries: InboxEntries;
}

interface InboxEntries {
  [roomID: string]: InboxEntry;
}

interface InboxEntry {
  messages: InboxEntryMessages;
  states: InboxEntryStates;
}

interface InboxEntryMessage extends MessagingStoreMessageData {
  archiveId?: string;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * METHODS
 * ************************************************************************* */

const fromCoreMessage = function (message: CoreMessage): InboxEntryMessage {
  return {
    id: message.id,
    archiveId: message.archiveId,
    type: message.type,
    date: message.date,
    from: message.from,
    content: message.content,

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

  getters: {
    getMessages: function () {
      return (roomID: RoomID): Array<InboxEntryMessage> => {
        return this.assert(roomID).messages.list;
      };
    },

    getMessage: function () {
      return (roomID: RoomID, id: string): InboxEntryMessage | void => {
        return this.assert(roomID).messages.byId[id] || undefined;
      };
    },

    getStates: function () {
      return (roomID: RoomID): Array<InboxEntryStates> => {
        return this.assert(roomID).states;
      };
    }
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    assert(roomID: RoomID): InboxEntry {
      const entries = this.entries;

      // Assign new inbox entry?
      if (!(roomID in entries)) {
        this.$patch(() => {
          // Insert with defaults
          entries[roomID] = {
            messages: {
              list: [],
              byId: {}
            },

            states: {
              composing: false
            }
          };
        });
      }

      return entries[roomID];
    },

    insertCoreMessages(roomID: RoomID, messages: CoreMessage[]): boolean {
      return this.insertMessages(
        roomID,
        messages.map(message => {
          return fromCoreMessage(message);
        })
      );
    },

    insertMessage(roomID: RoomID, message: InboxEntryMessage): boolean {
      return this.insertMessages(roomID, [message]);
    },

    insertMessages(
      roomID: RoomID,
      messages: Array<InboxEntryMessage>
    ): boolean {
      const container = this.assert(roomID).messages;

      // Initialize inserted marker
      let hasInserted = false;

      messages.forEach(message => {
        // Acquire message identifier
        const messageId = message.id;

        if (!messageId) {
          throw new Error("Cannot insert a message with no identifier");
        }

        // Attempt to update first?
        const wasUpdated = this.updateMessage(roomID, messageId, message);

        // Should insert message? (does not exist)
        if (wasUpdated !== true) {
          // Mark as inserted
          hasInserted = true;

          // Insert message in its container
          this.$patch(() => {
            container.byId[messageId] = message;
            container.list.push(message);
          });

          // Emit IPC inserted event
          EventBus.emit("message:inserted", {
            roomID: roomID,
            message
          } as EventMessageGeneric);
        }
      });

      return hasInserted;
    },

    updateMessage(
      roomID: RoomID,
      id: string,
      message: InboxEntryMessage
    ): boolean {
      const container = this.assert(roomID).messages;

      // Acquire message identifier
      const messageId = message.id;

      if (!messageId) {
        throw new Error("Cannot update a message with no identifier");
      }

      // Acquire message from store
      const existingMessage = container.byId[id] || null;

      if (existingMessage !== null) {
        // Duplicate existing message (before it gets mutated)
        const originalMessage = cloneDeep(existingMessage);

        this.$patch(() => {
          // Delete existing message at previous identifier
          delete container.byId[id];

          Object.assign(existingMessage, message);

          // Update existing message identifier (w/ replacement identifier)
          existingMessage.id = messageId;

          // Store existing message at new identifier
          container.byId[messageId] = existingMessage;
        });

        // Emit IPC updated event
        EventBus.emit("message:updated", {
          roomID: roomID,
          message: existingMessage,
          original: originalMessage
        } as EventMessageGeneric);

        // Mark as updated
        return true;
      }

      // Mark as non-updated
      return false;
    },

    retractMessage(roomID: RoomID, id: string): boolean {
      const container = this.assert(roomID).messages;

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
          roomID: roomID,
          message: existingMessage
        } as EventMessageGeneric);

        // Mark as retracted
        return true;
      }

      // Mark as non-retracted
      return false;
    },

    setComposing(roomID: RoomID, composing: boolean) {
      this.assert(roomID).states.composing = composing;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { fromCoreMessage };
export type { EventMessageGeneric, InboxEntryMessage };
export default $inbox;
