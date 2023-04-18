/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID } from "@xmpp/jid";
import merge from "lodash.merge";
import mitt from "mitt";
import { defineStore } from "pinia";
import { MessagingStoreMessageData } from "@prose-im/prose-core-views/types/messaging";

// PROJECT: BROKER
import { MessageChatState } from "@/broker/stanzas/message";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type InboxEntryMessages = {
  list: Array<InboxEntryMessage>;
  byId: { [id: string]: InboxEntryMessage };
};

type InboxEntryStates = {
  chatstate: MessageChatState;
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
 * TABLE
 * ************************************************************************* */

const $inbox = defineStore("inbox", {
  persist: true,

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
      const jidString = jid.bare().toString(),
        entries = this.entries;

      // Assign new inbox entry?
      if (!(jidString in entries)) {
        this.$patch(() => {
          // Insert with defaults
          entries[jidString] = {
            messages: {
              list: [],

              // TODO: do not store this in persistance layer
              byId: {} // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
            },

            states: {
              // TODO: do not store this in persistance layer
              chatstate: MessageChatState.Inactive
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
        if (!message.id) {
          throw new Error("Cannot insert a message with no identifier");
        }

        // Insert or update message
        const existingMessage = container.byId[message.id] || null;

        if (existingMessage !== null) {
          this.$patch(() => {
            merge(existingMessage, message);

            // TODO: remove temporary fix of lost reference when store is \
            //   restored
            const foundListMessage = container.list.find(listMessage => {
              return listMessage.id === existingMessage.id;
            });

            if (foundListMessage) {
              merge(foundListMessage, message);
            }
          });

          // Emit IPC updated event
          EventBus.emit("message:updated", existingMessage);
        } else {
          this.$patch(() => {
            container.byId[message.id] = message;
            container.list.push(message);
          });

          // Emit IPC inserted event
          EventBus.emit("message:inserted", message);
        }
      });
    },

    retractMessage(jid: JID, id: string) {
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
        EventBus.emit("message:retracted", existingMessage);
      }
    },

    setStatesChatstate(jid: JID, chatstate: MessageChatState) {
      this.assert(jid).states.chatstate = chatstate;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { InboxEntryMessage };
export default $inbox;
