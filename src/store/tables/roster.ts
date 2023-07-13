/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { defineStore } from "pinia";
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import Broker from "@/broker";
import { RosterItemGroup } from "@/broker/modules/roster";
import mitt from "mitt";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type RosterList = Array<RosterEntry>;

type RosterByGroup = {
  [group in RosterItemGroup]?: RosterList;
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
  group: RosterItemGroup;
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
  persist: true,

  state: (): Roster => {
    return {
      list: [],

      // TODO: do not store this in persistance layer
      byGroup: {}, // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
      byJID: {} // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
    };
  },

  getters: {
    getList: function () {
      return (group?: RosterItemGroup): RosterList => {
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
        const bareJIDString = jid.bare().toString();

        return this.byJID[bareJIDString] || undefined;
      };
    },

    getEntryName: function () {
      return (jid: JID): string => {
        return this.getEntry(jid)?.name || jid.local;
      };
    }
  },

  actions: {
    async load(reload = true): Promise<RosterList> {
      // Load roster? (or reload)
      if (LOCAL_STATES.loaded === false || reload === true) {
        LOCAL_STATES.loaded = true;

        // Initialize entries
        const entries: RosterList = [],
          byGroup: RosterByGroup = {},
          byJID: RosterByJID = {};

        // Load roster
        const roster = await Broker.$roster.loadRoster();

        roster.items.forEach(rosterItem => {
          // Append roster entry
          // Important: JID must be stored as string so that persistence works.
          const entry = {
            jid: rosterItem.jid.toString(),
            group: RosterItemGroup.Team,
            name: rosterItem.name
          };

          entries.push(entry);

          // Append entry into its group
          const byGroupEntries = byGroup[entry.group] || [];

          byGroupEntries.push(entry);

          byGroup[entry.group] = byGroupEntries;

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
      return EventBus
    },

    emitContactChanged(jid: string) {
      EventBus.emit("contact:changed", jid);
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { RosterList };
export default $roster;
