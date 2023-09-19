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
  RoomID,
  RoomType
} from "@prose-im/prose-sdk-js";

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

  directMessages: SidebarRoomEntry[];
  groups: SidebarRoomEntry[];
  privateChannels: SidebarRoomEntry[];
  publicChannels: SidebarRoomEntry[];
  genericRooms: SidebarRoomEntry[];
  roomsMap: Map<RoomID, Room>;
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
  persist: false,

  state: (): Roster => {
    return {
      list: [],

      // TODO: do not store this in persistance layer
      byGroup: {}, // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
      byJID: {}, // TODO: rebuild this from list, DO NOT store this in store as reference to list is lost
      directMessages: [],
      groups: [],
      publicChannels: [],
      privateChannels: [],
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
      return (): SidebarRoomEntry[] => {
        return this.directMessages;
      };
    },

    getGroups: function () {
      return (): SidebarRoomEntry[] => {
        return this.groups;
      };
    },

    getPrivateChannels: function () {
      return (): SidebarRoomEntry[] => {
        return this.privateChannels;
      };
    },

    getPublicChannels: function () {
      return (): SidebarRoomEntry[] => {
        return this.publicChannels;
      };
    },

    getGenericRooms: function () {
      return (): SidebarRoomEntry[] => {
        return this.genericRooms;
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
      const directMessages: SidebarRoomEntry[] = [],
        groups: SidebarRoomEntry[] = [],
        privateChannels: SidebarRoomEntry[] = [],
        publicChannels: SidebarRoomEntry[] = [],
        genericRooms: SidebarRoomEntry[] = [],
        roomsMap = new Map<RoomID, Room>();

      // Load rooms
      const rooms = await Broker.$roster.loadConnectedRooms();

      rooms.forEach(room => {
        switch (room.type) {
          case RoomType.DirectMessage:
            directMessages.push({ room: room });
            break;
          case RoomType.Group:
            groups.push({ room: room });
            break;
          case RoomType.PrivateChannel:
            privateChannels.push({ room: room });
            break;
          case RoomType.PublicChannel:
            publicChannels.push({ room: room });
            break;
          case RoomType.Generic:
            genericRooms.push({ room: room });
            break;
        }

        roomsMap.set(room.id, room);
      });

      const compareRooms = (
        lhs: SidebarRoomEntry,
        rhs: SidebarRoomEntry
      ): number => {
        return lhs.room.name.localeCompare(rhs.room.name);
      };

      this.$patch(state => {
        state.directMessages = directMessages.sort(compareRooms);
        state.groups = groups.sort(compareRooms);
        state.privateChannels = privateChannels.sort(compareRooms);
        state.publicChannels = publicChannels.sort(compareRooms);
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
