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
import { defineStore } from "pinia";
import { MessagingStoreMessageData } from "@prose-im/prose-core-views/types/messaging";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type InboxEntryMessage = MessagingStoreMessageData;

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
  messages: Array<InboxEntryMessage>;
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
        return this.assertEntry(jid).messages;
      };
    },

    getProfile: function () {
      return (jid: JID): InboxEntryProfile | void => {
        return this.assertEntry(jid).profile || undefined;
      };
    }
  },

  actions: {
    assertEntry(jid: JID): InboxEntry {
      const jidString = jid.bare().toString();

      // Assign new inbox entry?
      if (!(jidString in this)) {
        this.$patch(() => {
          this[jidString] = {
            messages: []
          };
        });
      }

      return this[jidString];
    },

    insertMessage(jid: JID, message: InboxEntryMessage) {
      this.insertMessages(jid, [message]);
    },

    insertMessages(jid: JID, messages: Array<InboxEntryMessage>) {
      // TODO: send IPC whenever a new message is inserted, eg. message:inserted
      // TODO: also send IPC on update, eg. message:updated

      this.assertEntry(jid).messages.push(...messages);
    },

    setProfile(jid: JID, profile: InboxEntryProfile) {
      this.assertEntry(jid).profile = profile;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $inbox;
