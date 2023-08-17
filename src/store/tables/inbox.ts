/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, Message as CoreMessage } from "@prose-im/prose-sdk-js";
import cloneDeep from "lodash.clonedeep";
import mitt from "mitt";
import { defineStore } from "pinia";
import { MessagingStoreMessageData } from "@prose-im/prose-core-views/types/messaging";

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
  jid: JID;
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
  [jid: string]: InboxEntry;
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
      return (jid: JID): Array<InboxEntryMessage> => {
        return this.assert(jid).messages.list;
      };
    },

    getMessage: function () {
      return (jid: JID, id: string): InboxEntryMessage | void => {
        return this.assert(jid).messages.byId[id] || undefined;
      };
    },

    getStates: function () {
      return (jid: JID): Array<InboxEntryStates> => {
        return this.assert(jid).states;
      };
    }
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    assert(jid: JID): InboxEntry {
      const jidString = jid.toString(),
        entries = this.entries;

      // Assign new inbox entry?
      if (!(jidString in entries)) {
        this.$patch(() => {
          // Insert with defaults
          entries[jidString] = {
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

      return entries[jidString];
    },

    insertMessage(jid: JID, message: InboxEntryMessage) {
      this.insertMessages(jid, [message]);
    },

    insertMessages(jid: JID, messages: Array<InboxEntryMessage>) {
      const container = this.assert(jid).messages;

      messages.forEach(message => {
        // Acquire message identifier
        const messageId = message.id;

        if (!messageId) {
          throw new Error("Cannot insert a message with no identifier");
        }

        // Attempt to update first?
        const wasUpdated = this.updateMessage(jid, messageId, message);

        // Should insert message? (does not exist)
        if (wasUpdated !== true) {
          this.$patch(() => {
            container.byId[messageId] = message;
            container.list.push(message);
          });

          // Emit IPC inserted event
          EventBus.emit("message:inserted", {
            jid: jid,
            message
          } as EventMessageGeneric);
        }
      });
    },

    updateMessage(jid: JID, id: string, message: InboxEntryMessage): boolean {
      const container = this.assert(jid).messages;

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
          jid: jid,
          message: existingMessage,
          original: originalMessage
        } as EventMessageGeneric);

        // Mark as updated
        return true;
      }

      // Mark as non-updated
      return false;
    },

    retractMessage(jid: JID, id: string): boolean {
      const container = this.assert(jid).messages;

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
          jid: jid,
          message: existingMessage
        } as EventMessageGeneric);

        // Mark as retracted
        return true;
      }

      // Mark as non-retracted
      return false;
    },

    setComposing(jid: JID, composing: boolean) {
      this.assert(jid).states.composing = composing;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { InboxEntryMessage, EventMessageGeneric };
export { fromCoreMessage };
export default $inbox;
