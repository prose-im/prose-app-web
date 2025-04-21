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
  Room as CoreRoom,
  RoomType,
  RoomID,
  SidebarItem,
  SidebarSection
} from "@prose-im/prose-sdk-js";
import mitt from "mitt";
import { defineStore } from "pinia";
import { firstBy } from "thenby";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

// PROJECT: STORES
import Store from "@/store";
import { AvatarSource } from "@/store/tables/avatar";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Room {
  items: {
    all: SidebarItem[];
    favorites: SidebarItem[];
    directMessages: SidebarItem[];
    channels: SidebarItem[];
    byRoomId: Map<RoomID, SidebarItem>;
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

const ROOM_TYPE_PRIORITIES = {
  [RoomType.DirectMessage]: 0,
  [RoomType.Group]: 1,
  [RoomType.PrivateChannel]: 2,
  [RoomType.PublicChannel]: 3,
  [RoomType.Generic]: 4
};

/**************************************************************************
 * METHODS
 * ************************************************************************* */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeSidebarItemSorter = function (): IThenBy<any> {
  // Sorting rules:
  //  - #1. Rooms are ordered by their type, most private rooms come first
  //  - #2. Rooms are ordered by name, alphabetically
  //  - #3. Finally, order by room identifier for sort stability on 2 same names
  return firstBy((item: SidebarItem) => {
    return ROOM_TYPE_PRIORITIES[item.room.type];
  })
    .thenBy("name", { ignoreCase: true })
    .thenBy((item: SidebarItem) => {
      return item.room.id as string;
    });
};

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $room = defineStore("room", {
  persist: false,

  state: (): Room => {
    return {
      items: {
        all: [],
        favorites: [],
        directMessages: [],
        channels: [],
        byRoomId: new Map()
      },

      byId: new Map()
    };
  },

  getters: {
    getItems: function () {
      return (): Array<SidebarItem> => {
        return this.items.all;
      };
    },

    getItemFavorites: function () {
      return (): Array<SidebarItem> => {
        return this.items.favorites;
      };
    },

    getItemDirectMessages: function () {
      return (): Array<SidebarItem> => {
        return this.items.directMessages;
      };
    },

    getItemChannels: function () {
      return (): Array<SidebarItem> => {
        return this.items.channels;
      };
    },

    getRoomItem: function () {
      return (roomID: RoomID): SidebarItem | void => {
        return this.items.byRoomId.get(roomID);
      };
    },

    getRoom: function () {
      return (roomID: RoomID): CoreRoom | void => {
        return this.byId.get(roomID);
      };
    }
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    async load(reload = false): Promise<void> {
      // Load room list? (or reload)
      if (LOCAL_STATES.loaded !== true || reload === true) {
        // Initialize entries
        const all: Array<SidebarItem> = [],
          favorites: Array<SidebarItem> = [],
          directMessages: Array<SidebarItem> = [],
          channels: Array<SidebarItem> = [],
          itemsByRoomId = new Map<RoomID, SidebarItem>(),
          roomsById = new Map<RoomID, CoreRoom>();

        // Initialize total unread count
        let totalUnreadCount = 0;

        // Load rooms
        const sidebarItems = await Broker.$room.sidebarItems();

        sidebarItems.forEach(item => {
          // Append item to list of all items
          all.push(item);

          // Append item in its section
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

          // Reference item by its identifier
          itemsByRoomId.set(item.room.id, item);
          roomsById.set(item.room.id, item.room);

          // Increment unread count
          totalUnreadCount += item.unreadCount;
        });

        // Append all rooms
        this.$patch(state => {
          // Store all items
          state.items.all = all.sort(makeSidebarItemSorter());

          // Store categorized items
          state.items.favorites = favorites.sort(makeSidebarItemSorter());
          state.items.directMessages = directMessages.sort(
            makeSidebarItemSorter()
          );
          state.items.channels = channels.sort(makeSidebarItemSorter());

          state.items.byRoomId = itemsByRoomId;

          // Store rooms map
          state.byId = roomsById;
        });

        // Refresh all room associated data
        all.forEach(item => {
          this.requestRefreshRoomAssociations(item.room.id);
        });

        // Update unread count (it might have changed)
        // Notice: check if badges are allowed or not, otherwise reset back to \
        //   zero.
        UtilitiesRuntime.requestUnreadCountUpdate(
          Store.$settings.notifications.action.notify.badge === true
            ? totalUnreadCount
            : 0
        );

        // Mark as loaded
        LOCAL_STATES.loaded = true;
      }
    },

    updateRoom(roomID: RoomID, roomData: CoreRoom): CoreRoom | void {
      // Assert room (update only if it exists)
      // Notice: only update room if it exists in storage, by updating the \
      //   whole Map entry, instead of using 'Object.assign()', which is \
      //   known to cause issues due to wasm-bindgen pointers once they get \
      //   garbage-collected. We want to replace the whole Room object with \
      //   the new one, which may contain new memory references.
      if (this.getRoom(roomID) !== undefined) {
        this.byId.set(roomID, roomData);

        // Refresh room associated data
        this.requestRefreshRoomAssociations(roomID);

        return roomData;
      }
    },

    requestRefreshRoomAssociations(roomID: RoomID): void {
      this.getRoom(roomID)?.participants.forEach(participant => {
        // Refresh avatar for participant?
        // Notice: this is a cross-store operation, for convenience.
        if (participant.avatar !== undefined) {
          // Notice: prefer using JID over abstract participant identifier, \
          //   if JID is known.
          const participantUserId =
            participant.jid !== undefined
              ? participant.jid.toString()
              : participant.id.toString();

          Store.$avatar.refresh(
            AvatarSource.Profile,
            participantUserId,
            participant.avatar
          );
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
