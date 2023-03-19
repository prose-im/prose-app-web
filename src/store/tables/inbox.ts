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

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type InboxEntryMessage = {
  id: string;
  // TODO: add all fields
};

type InboxEntryProfile = {
  firstName: string;
  lastName: string;
  // TODO: add all fields
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
    getMessages: (state: Inbox) => {
      return (jid: JID): Array<InboxEntryMessage> | void => {
        state[jid.toString()]?.messages || undefined;
      };
    },

    getProfile: (state: Inbox) => {
      return (jid: JID): InboxEntryProfile | void => {
        state[jid.toString()]?.profile || undefined;
      };
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $inbox;
