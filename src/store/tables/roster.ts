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

// PROJECT: BROKER
import Broker from "@/broker";
import { RosterItemGroup } from "@/broker/modules/roster";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type RosterList = Array<RosterEntry>;

type RosterByGroup = {
  [group in RosterItemGroup]?: RosterList;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Roster {
  list: RosterList;
  byGroup: RosterByGroup;
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

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $roster = defineStore("roster", {
  persist: true,

  state: (): Roster => {
    return {
      list: [],

      // TODO: do not store this in persistance layer
      byGroup: {} // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
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
    }
  },

  actions: {
    async load(reload = true): Promise<RosterList> {
      // Load roster? (or reload)
      if (LOCAL_STATES.loaded === false || reload === true) {
        LOCAL_STATES.loaded = true;

        // Initialize entries
        const entries: RosterList = [],
          byGroup: RosterByGroup = {};

        // Load roster
        const roster = await Broker.$roster.loadRoster();

        roster.items.forEach(rosterItem => {
          // Append roster entry
          // Important: JID must be stored as string so that persistence works.
          const entry = {
            jid: rosterItem.jid.toString(),
            group: rosterItem.group,
            name: rosterItem.name ? rosterItem.name : rosterItem.jid.local
          };

          entries.push(entry);

          // Append entry into its group
          const byGroupEntries = byGroup[rosterItem.group] || [];

          byGroupEntries.push(entry);

          byGroup[rosterItem.group] = byGroupEntries;
        });

        this.$patch(state => {
          state.list = entries;
          state.byGroup = byGroup;
        });
      }

      return Promise.resolve(this.list);
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { RosterList };
export default $roster;
