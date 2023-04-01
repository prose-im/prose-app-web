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
    return {
      // TODO: those are fixtures
      "valerian@prose.org": {
        messages: [
          {
            id: "b4d303b1-17c9-4863-81b7-bc5281f3590f",
            type: "text",
            date: "2022-06-22T19:15:03.000Z",
            from: "valerian@prose.org",
            content:
              "Quick message just to confirm that I asked the designers for a new illustration.",

            metas: {
              encrypted: true,
              edited: false
            }
          },

          {
            id: "2abc1d01-da43-45bd-8bdd-a1b37c072ff1",
            type: "text",
            date: "2022-06-22T19:15:04.000Z",
            from: "valerian@prose.org",
            content: "We need one more for the blog.",

            metas: {
              encrypted: true,
              edited: false
            }
          },

          {
            id: "fe685272-2a23-4701-9e4e-a9605697b8c7",
            type: "text",
            date: "2022-06-24T19:15:05.000Z",
            from: "valerian@prose.org",
            content: "Might be done tomorrow 😀",

            metas: {
              encrypted: true,
              edited: false
            },

            reactions: [
              {
                reaction: "🤠",
                authors: ["valerian@prose.org", "baptiste@crisp.chat"]
              },

              {
                reaction: "🚀",
                authors: ["baptiste@crisp.chat"]
              }
            ]
          }
        ],

        profile: {
          name: {
            first: "Valerian",
            last: "Saliou"
          },

          role: "CTO at Crisp",

          information: {
            contact: {
              email: "valerian@prose.org",
              phone: "+33631210280"
            },

            lastActive: {
              timestamp: 1680376033407
            },

            location: {
              country: "FR",
              timezone: "Europe/Lisbon"
            },

            activity: {
              icon: "👨‍💻",
              text: "Focusing on code"
            }
          },

          security: {
            verification: {
              fingerprint: "C648A",
              email: "valerian@prose.org",
              phone: "+33631210280",
              identity: "Valerian Saliou"
            },

            encryption: {
              connectionProtocol: "TLS 1.3",
              messageEndToEndMethod: "OMEMO"
            }
          }
        }
      }
    };
  },

  getters: {
    getMessages: (state: Inbox) => {
      return (jid: JID): Array<InboxEntryMessage> | void => {
        return state[jid.toString()]?.messages || undefined;
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
