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

type InboxEntryMessage = MessagingStoreMessageData;

type InboxEntryStates = {
  chatstate: MessageChatState;
};

type InboxEntryProfile = {
  name: InboxEntryProfileName;
  role: string;
  information: InboxEntryProfileInformation;
  security: InboxEntryProfileSecurity;
};

type InboxEntryProfileName = {
  first: string;
  last: string;
};

type InboxEntryProfileInformation = {
  contact: InboxEntryProfileInformationContact;
  lastActive: InboxEntryProfileInformationLastActive | null;
  location: InboxEntryProfileInformationLocation;
  activity: InboxEntryProfileInformationActivity | null;
};

type InboxEntryProfileInformationContact = {
  email: string | null;
  phone: string | null;
};

type InboxEntryProfileInformationLastActive = {
  timestamp: number | null;
};

type InboxEntryProfileInformationLocation = {
  country: string | null;
  timezone: string | null;
};

type InboxEntryProfileInformationActivity = {
  icon: string | null;
  text: string;
};

type InboxEntryProfileSecurity = {
  verification: InboxEntryProfileSecurityVerification | null;
  encryption: InboxEntryProfileSecurityEncryption | null;
};

type InboxEntryProfileSecurityVerification = {
  fingerprint: string | null;
  email: string | null;
  phone: string | null;
  identity: string | null;
};

type InboxEntryProfileSecurityEncryption = {
  connectionProtocol: string;
  messageEndToEndMethod: string;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Inbox {
  [jid: string]: InboxEntry;
}

interface InboxEntry {
  messages: InboxEntryMessages;
  states: InboxEntryStates;
  profile?: InboxEntryProfile;
}

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $inbox = defineStore("inbox", {
  persist: true,

  state: (): Inbox => {
    return {};
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
    },

    getProfile: function () {
      return (jid: JID): InboxEntryProfile | void => {
        return this.assert(jid).profile || undefined;
      };
    }
  },

  actions: {
    assert(jid: JID): InboxEntry {
      const jidString = jid.bare().toString();

      // Assign new inbox entry?
      if (!(jidString in this)) {
        this.$patch(() => {
          // Insert with defaults
          this[jidString] = {
            messages: {
              list: [],
              byId: {}
            },

            states: {
              chatstate: MessageChatState.Inactive
            }
          };
        });
      }

      return this[jidString];
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
          merge(existingMessage, message);

          // TODO: send IPC for update
        } else {
          container.byId[message.id] = message;
          container.list.push(message);

          // TODO: send IPC for insert
        }
      });
    },

    setStatesChatstate(jid: JID, chatstate: MessageChatState) {
      this.assert(jid).states.chatstate = chatstate;
    },

    setProfile(jid: JID, profile: InboxEntryProfile) {
      this.assert(jid).profile = profile;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $inbox;
