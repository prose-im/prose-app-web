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
 * TYPES
 * ************************************************************************* */

type RosterList = Array<RosterEntry>;

type RosterByGroup = {
  [group in RosterGroup]?: RosterList;
};

type RosterByJID = {
  [jid: string]: RosterEntry;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Roster {
  list: RosterList;
  byGroup: RosterByGroup;
  byJID: RosterByJID;
}

interface RosterEntry {
  jid: string;
  availability: Availability;
  group: RosterGroup;
  name: string;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  loaded: false
};

const EventBus = mitt();

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $roster = defineStore("roster", {
  persist: false,

  state: (): Roster => {
    return {
      list: [],
      byGroup: {},
      byJID: {}
    };
  },

  getters: {
    getList: function () {
      return (group?: RosterGroup): RosterList => {
        // Acquire list in group
        if (group !== undefined) {
          return this.byGroup[group] || [];
        }

        // Acquire global list (all groups)
        return this.list;
      };
    },

    getGroups: function () {
      return (): RosterByGroup => {
        return this.byGroup;
      };
    },

    getEntry: function () {
      return (jid: JID): RosterEntry | void => {
        return this.byJID[jid.toString()] || undefined;
      };
    }
  },

  actions: {
    async load(reload = false): Promise<RosterList> {
      // Load roster? (or reload)
      if (LOCAL_STATES.loaded === false || reload === true) {
        LOCAL_STATES.loaded = true;

        // Initialize entries
        const entries: RosterList = [],
          byGroup: RosterByGroup = {},
          byJID: RosterByJID = {};

        // Load roster
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
        });

        this.$patch(state => {
          state.list = entries;
          state.byGroup = byGroup;
          state.byJID = byJID;
        });
      }

      return Promise.resolve(this.list);
    },

    events(): ReturnType<typeof mitt> {
      return EventBus;
    },

    markContactsChanged() {
      EventBus.emit("contacts:changed");
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { RosterEntry, RosterList };
export default $roster;
