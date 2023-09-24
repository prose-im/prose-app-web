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
  Room,
  RoomID,
  RoomType,
  Group as RosterGroup
} from "@prose-im/prose-sdk-js";
import { defineStore } from "pinia";

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

  directMessages: Room[];
  channels: Room[];
  genericRooms: Room[];
  roomsMap: Map<RoomID, Room>;
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

      // TODO: do not store this in persistance layer
      byGroup: {}, // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
      byJID: {}, // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
      directMessages: [],
      channels: [],
      genericRooms: [],
      roomsMap: new Map()
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

    getDirectMessages: function () {
      return (): Room[] => {
        return this.directMessages;
      };
    },

    getChannels: function () {
      return (): Room[] => {
        return this.channels;
      };
    },

    getGenericRooms: function () {
      return (): Room[] => {
        return this.genericRooms;
      };
    },

    insertRoom: function (room: Room) {
      const compareRooms = (lhs: Room, rhs: Room): number => {
        return lhs.name.localeCompare(rhs.name);
      };

      return (room: Room) => {
        this.$patch(state => {
          switch (room.type) {
            case RoomType.DirectMessage:
              state.directMessages.push(room);
              state.directMessages.sort(compareRooms);
              break;
            case RoomType.Group:
              state.directMessages.push(room);
              state.directMessages.sort(compareRooms);
              break;
            case RoomType.PrivateChannel:
              state.channels.push(room);
              state.channels.sort(compareRooms);
              break;
            case RoomType.PublicChannel:
              state.channels.push(room);
              state.channels.sort(compareRooms);
              break;
            case RoomType.Generic:
              state.genericRooms.push(room);
              state.genericRooms.sort(compareRooms);
              break;
          }
        });
      };
    },

    getRoomByID: function () {
      return (roomID: RoomID): Room | undefined => {
        return this.roomsMap.get(roomID);
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
    },

    getAvailableRoomIDs: function () {
      return (): RoomID[] => {
        return Array.from(this.roomsMap.keys());
      };
    }
  },

  actions: {
    async load(reload = false): Promise<RosterList> {
      // Load roster? (or reload)
      if (LOCAL_STATES.loaded === true && reload === false) {
        return Promise.resolve(this.list);
      }

      LOCAL_STATES.loaded = true;

      // Initialize entries
      const directMessages: Room[] = [],
        channels: Room[] = [],
        genericRooms: Room[] = [],
        roomsMap = new Map<RoomID, Room>();

      // Load rooms
      const rooms = Broker.$muc.connectedRooms();

      rooms.forEach(room => {
        switch (room.type) {
          case RoomType.DirectMessage:
            directMessages.push(room);
            break;
          case RoomType.Group:
            directMessages.push(room);
            break;
          case RoomType.PrivateChannel:
            channels.push(room);
            break;
          case RoomType.PublicChannel:
            channels.push(room);
            break;
          case RoomType.Generic:
            genericRooms.push(room);
            break;
        }

        roomsMap.set(room.id, room);
      });

      const compareRooms = (lhs: Room, rhs: Room): number => {
        return lhs.name.localeCompare(rhs.name);
      };

      this.$patch(state => {
        state.directMessages = directMessages.sort(compareRooms);
        state.channels = channels.sort(compareRooms);
        state.genericRooms = genericRooms.sort(compareRooms);
        state.roomsMap = roomsMap;
      });

      return Promise.resolve(this.list);
    },

    events(): ReturnType<typeof mitt> {
      return EventBus;
    },

    markContactChanged(jid: JID) {
      EventBus.emit("contact:changed", jid);
    },

    markRoomsChanged() {
      EventBus.emit("rooms:changed");
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { RosterList };
export default $roster;
