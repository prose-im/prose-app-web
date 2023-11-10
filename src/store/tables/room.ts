/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import mitt from "mitt";
import { defineStore } from "pinia";
import { Room as CoreRoom, RoomID, RoomType } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Room {
  directMessages: CoreRoom[];
  channels: CoreRoom[];
  genericRooms: CoreRoom[];
  roomsMap: Map<RoomID, CoreRoom>;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  loaded: false
};

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $room = defineStore("room", {
  persist: false,

  state: (): Room => {
    return {
      directMessages: [],
      channels: [],
      genericRooms: [],
      roomsMap: new Map()
    };
  },

  getters: {
    getDirectMessages: function () {
      return (): CoreRoom[] => {
        return this.directMessages;
      };
    },

    getChannels: function () {
      return (): CoreRoom[] => {
        return this.channels;
      };
    },

    getGenericRooms: function () {
      return (): CoreRoom[] => {
        return this.genericRooms;
      };
    },

    getRoomByID: function () {
      return (roomID: RoomID): CoreRoom | undefined => {
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
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    load(reload = false): void {
      // Load room list? (or reload)
      if (LOCAL_STATES.loaded !== true || reload === true) {
        LOCAL_STATES.loaded = true;

        // Initialize entries
        const directMessages: CoreRoom[] = [],
          channels: CoreRoom[] = [],
          genericRooms: CoreRoom[] = [],
          roomsMap = new Map<RoomID, CoreRoom>();

        // Load rooms
        const rooms = Broker.$room.connectedRooms();

        rooms.forEach(room => {
          switch (room.type) {
            case RoomType.DirectMessage: {
              directMessages.push(room);

              break;
            }

            case RoomType.Group: {
              directMessages.push(room);

              break;
            }

            case RoomType.PrivateChannel: {
              channels.push(room);

              break;
            }

            case RoomType.PublicChannel: {
              channels.push(room);

              break;
            }

            case RoomType.Generic: {
              genericRooms.push(room);

              break;
            }
          }

          roomsMap.set(room.id, room);
        });

        // Append all rooms
        const compareRooms = (left: CoreRoom, right: CoreRoom): number => {
          return left.name.localeCompare(right.name);
        };

        this.$patch(state => {
          state.directMessages = directMessages.sort(compareRooms);
          state.channels = channels.sort(compareRooms);
          state.genericRooms = genericRooms.sort(compareRooms);
          state.roomsMap = roomsMap;
        });
      }
    },

    insertRoom(room: CoreRoom): void {
      const compareRooms = (left: CoreRoom, right: CoreRoom): number => {
        return left.name.localeCompare(right.name);
      };

      this.$patch(state => {
        switch (room.type) {
          case RoomType.DirectMessage: {
            state.directMessages.push(room);
            state.directMessages.sort(compareRooms);

            break;
          }

          case RoomType.Group: {
            state.directMessages.push(room);
            state.directMessages.sort(compareRooms);

            break;
          }

          case RoomType.PrivateChannel: {
            state.channels.push(room);
            state.channels.sort(compareRooms);

            break;
          }

          case RoomType.PublicChannel: {
            state.channels.push(room);
            state.channels.sort(compareRooms);

            break;
          }

          case RoomType.Generic: {
            state.genericRooms.push(room);
            state.genericRooms.sort(compareRooms);

            break;
          }
        }
      });
    },

    markRoomsChanged(): void {
      EventBus.emit("rooms:changed");
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $room;
