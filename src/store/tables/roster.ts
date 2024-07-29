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
  Availability,
  JID,
  Group as RosterGroup
} from "@prose-im/prose-sdk-js";
import { defineStore } from "pinia";
import mitt from "mitt";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum RosterBlockListStatus {
  // Blocked status.
  Blocked = "blocked",
  // Unblocked status.
  Unblocked = "unblocked"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type RosterContactsList = Array<RosterContactsEntry>;

type RosterContactsByGroup = {
  [group in RosterGroup]?: RosterContactsList;
};

type RosterContactsByJID = {
  [jid: string]: RosterContactsEntry;
};

type RosterBlockListList = Array<RosterBlockListEntry>;

type RosterBlockListByJID = {
  [jid: string]: RosterBlockListEntry;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Roster {
  contacts: RosterContacts;
  blockList: RosterBlockList;
}

interface RosterContacts {
  list: RosterContactsList;
  byGroup: RosterContactsByGroup;
  byJID: RosterContactsByJID;
}

interface RosterContactsEntry {
  jid: string;
  availability: Availability;
  group: RosterGroup;
  name: string;
}

interface RosterBlockList {
  list: RosterBlockListList;
  byJID: RosterBlockListByJID;
}

interface RosterBlockListEntry {
  jid: string;
  name: string;
  status: RosterBlockListStatus;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  contactsLoaded: false,
  blockListLoaded: false
};

const EventBus = mitt();

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $roster = defineStore("roster", {
  persist: false,

  state: (): Roster => {
    return {
      contacts: {
        list: [],
        byGroup: {},
        byJID: {}
      },

      blockList: {
        list: [],
        byJID: {}
      }
    };
  },

  getters: {
    getContactsList: function () {
      return (group?: RosterGroup): RosterContactsList => {
        // Acquire list in group
        if (group !== undefined) {
          return this.contacts.byGroup[group] || [];
        }

        // Acquire global list (all groups)
        return this.contacts.list;
      };
    },

    getContactsGroups: function () {
      return (): RosterContactsByGroup => {
        return this.contacts.byGroup;
      };
    },

    getContactsEntry: function () {
      return (jid: JID): RosterContactsEntry | void => {
        return this.contacts.byJID[jid.toString()] || undefined;
      };
    },

    getBlockListList: function () {
      return (): RosterBlockListList => {
        return this.blockList.list;
      };
    },

    getBlockListStatus: function () {
      return (jid: JID): RosterBlockListStatus => {
        const status = this.blockList.byJID[jid.toString()]?.status;

        return status === undefined ? RosterBlockListStatus.Unblocked : status;
      };
    }
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      return EventBus;
    },

    async loadContacts(reload = false): Promise<RosterContactsList> {
      // Load contacts? (or reload)
      if (LOCAL_STATES.contactsLoaded === false || reload === true) {
        // Initialize entries
        const entries: RosterContactsList = [],
          byGroup: RosterContactsByGroup = {},
          byJID: RosterContactsByJID = {};

        // Load contacts
        const contacts = await Broker.$roster.loadContacts();

        contacts.forEach(contact => {
          // Assign contact status to activity
          // Notice: this is a cross-store operation, for convenience.
          Store.$activity.setActivity(contact.jid, contact.status);

          // Append roster entry
          // Important: JID must be stored as string so that persistence works.
          const entry = {
            jid: contact.jid.toString(),
            availability: contact.availability,
            group: contact.group,
            name: contact.name
          };

          entries.push(entry);

          // Append entry into its group
          const byGroupEntries = byGroup[entry.group as RosterGroup] || [];

          byGroupEntries.push(entry);

          byGroup[entry.group as RosterGroup] = byGroupEntries;

          // Append entry to per-JID storage
          byJID[entry.jid] = entry;

          // Refresh avatar for contact
          // Notice: this is a cross-store operation, for convenience.
          // TODO: implement once SDK has bindings
          // if (contact.avatar !== undefined) {
          //   Store.$avatar.refresh(contact.jid, contact.avatar);
          // }
        });

        this.$patch(state => {
          state.contacts.list = entries;
          state.contacts.byGroup = byGroup;
          state.contacts.byJID = byJID;
        });

        // Mark as loaded
        LOCAL_STATES.contactsLoaded = true;
      }

      return this.contacts.list;
    },

    async loadBlockList(reload = false): Promise<RosterBlockListList> {
      // Load block list? (or reload)
      if (LOCAL_STATES.blockListLoaded === false || reload === true) {
        // Initialize entries
        const entries: RosterBlockListList = [],
          byJID: RosterBlockListByJID = {};

        // Load block list
        const blockList = await Broker.$roster.loadBlockList();

        blockList.forEach(blockListItem => {
          // Append block list entry
          const entry = {
            jid: blockListItem.jid.toString(),
            name: blockListItem.name,
            status: RosterBlockListStatus.Blocked
          };

          entries.push(entry);

          // Append entry to per-JID storage
          byJID[entry.jid] = entry;

          // Refresh avatar for item
          // Notice: this is a cross-store operation, for convenience.
          if (blockListItem.avatar !== undefined) {
            Store.$avatar.refresh(blockListItem.jid, blockListItem.avatar);
          }
        });

        this.$patch(state => {
          state.blockList.list = entries;
          state.blockList.byJID = byJID;
        });

        // Mark as loaded
        LOCAL_STATES.blockListLoaded = true;
      }

      return this.blockList.list;
    },

    markContactsChanged(): void {
      EventBus.emit("contacts:changed");
    },

    markBlockListChanged(): void {
      EventBus.emit("blocklist:changed");
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { RosterBlockListStatus };
export type { RosterContactsEntry, RosterContactsList, RosterBlockListEntry };
export default $roster;
