/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Room, RoomID, RoomType } from "@prose-im/prose-sdk-js";

// PROJECT: STORES

import { defineStore } from "pinia";

// PROJECT: BROKER
import Broker from "@/broker";
import mitt from "mitt";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface MUC {
  directMessages: Room[];
  channels: Room[];
  genericRooms: Room[];
  roomsMap: Map<RoomID, Room>;
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

const $muc = defineStore("muc", {
  persist: false,

  state: (): MUC => {
    return {
      directMessages: [],
      channels: [],
      genericRooms: [],
      roomsMap: new Map()
    };
  },

  getters: {
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

    getAvailableRoomIDs: function () {
      return (): RoomID[] => {
        return Array.from(this.roomsMap.keys());
      };
    }
  },

  actions: {
    load(reload = false): Promise<void> {
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

    markRoomsChanged() {
      EventBus.emit("rooms:changed");
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $muc;
