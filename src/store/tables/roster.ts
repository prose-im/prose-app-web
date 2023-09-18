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
import {
  JID,
  Availability,
  Group as RosterGroup,
  Room,
  RoomID
} from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";
import mitt from "mitt";

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
  channels: SidebarRoomEntry[];
}

interface RosterEntry {
  jid: string;
  availability: Availability;
  group: RosterGroup;
  name: string;
}

interface SidebarRoomEntry {
  room: Room;
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
      byJID: {}, // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
      channels: []
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

    getChannels: function () {
      return (): SidebarRoomEntry[] => {
        return this.channels;
      };
    },

    getRoomByID: function () {
      return (roomID: RoomID): Room | undefined => {
        return this.channels.find(entry => entry.room.id == roomID)?.room;
      };
    },

    getEntry: function () {
      return (jid: JID): RosterEntry | void => {
        return this.byJID[jid.toString()] || undefined;
      };
    },

    getEntryName: function () {
      return (jid: JID): string => {
        return this.getEntry(jid)?.name || jid.node || jid.toString();
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
          byJID: RosterByJID = {},
          channels: SidebarRoomEntry[] = [];

        // Load roster
        const contacts = await Broker.$roster.loadContacts();

        contacts.forEach(contact => {
          Store.$activity.setActivity(contact.jid, contact.activity);

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

        const rooms = await Broker.$roster.loadConnectedRooms();

        rooms.forEach(room => {
          switch (room.kind) {
            case "direct-message":
              break;
            case "group":
              break;
            case "private-channel":
              channels.push({ room: room });
              break;
            case "public-channel":
              channels.push({ room: room });
              break;
          }
        });

        this.$patch(state => {
          state.list = entries;
          state.byGroup = byGroup;
          state.byJID = byJID;
          state.channels = channels.sort((lhs, rhs) => {
            return lhs.room.name.localeCompare(rhs.room.name);
          });
        });
      }

      return Promise.resolve(this.list);
    },

    events(): ReturnType<typeof mitt> {
      return EventBus;
    },

    markContactChanged(jid: JID) {
      EventBus.emit("contact:changed", jid);
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { RosterList };
export default $roster;
