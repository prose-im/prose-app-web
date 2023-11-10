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
import {
  Room as CoreRoom,
  RoomID,
  SidebarSection,
  SidebarItem
} from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Room {
  items: {
    favorites: SidebarItem[];
    directMessages: SidebarItem[];
    channels: SidebarItem[];
  };

  byId: Map<RoomID, CoreRoom>;
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
      items: {
        favorites: [],
        directMessages: [],
        channels: []
      },

      byId: new Map()
    };
  },

  getters: {
    getItemFavorites: function () {
      return (): SidebarItem[] => {
        return this.items.favorites;
      };
    },

    getItemDirectMessages: function () {
      return (): SidebarItem[] => {
        return this.items.directMessages;
      };
    },

    getItemChannels: function () {
      return (): SidebarItem[] => {
        return this.items.channels;
      };
    },

    getRoom: function () {
      return (roomID: RoomID): CoreRoom | undefined => {
        return this.byId.get(roomID);
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
        const favorites: SidebarItem[] = [],
          directMessages: SidebarItem[] = [],
          channels: SidebarItem[] = [],
          roomsById = new Map<RoomID, CoreRoom>();

        // Load rooms
        const sidebarItems = Broker.$room.sidebarItems();

        sidebarItems.forEach(item => {
          switch (item.section) {
            case SidebarSection.Favorites: {
              favorites.push(item);

              break;
            }

            case SidebarSection.DirectMessage: {
              directMessages.push(item);

              break;
            }

            case SidebarSection.Channel: {
              channels.push(item);

              break;
            }
          }

          roomsById.set(item.room.id, item.room);
        });

        // Append all rooms
        const compareRooms = (
          left: SidebarItem,
          right: SidebarItem
        ): number => {
          return left.name.localeCompare(right.name);
        };

        this.$patch(state => {
          // Store items
          state.items.favorites = favorites.sort(compareRooms);
          state.items.directMessages = directMessages.sort(compareRooms);
          state.items.channels = channels.sort(compareRooms);

          // Store rooms map
          state.byId = roomsById;
        });
      }
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
