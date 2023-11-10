<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-sidebar-main
  list-disclosure(
    @toggle="onSpotlightToggle"
    :expanded="layout.sidebar.sections.spotlight"
    :list-class="disclosureListClass"
    title="Spotlight"
  )
    sidebar-main-item-section(
      title="Unread stack"
      icon="tray.2"
      disabled
    )

    sidebar-main-item-section(
      title="Replies"
      icon="arrowshape.turn.up.left.2"
      disabled
    )

    sidebar-main-item-section(
      title="Direct messages"
      icon="message"
      disabled
    )

    sidebar-main-item-section(
      title="People & groups"
      icon="text.book.closed"
      disabled
    )

  list-disclosure(
    v-if="itemFavorites.length > 0"
    @toggle="onFavoritesToggle"
    :expanded="layout.sidebar.sections.favorites"
    :list-class="disclosureListClass"
    title="Favorites"
  )
    sidebar-main-item-user(
      v-for="itemFavorite in itemFavorites"
      :jid="itemFavorite.jid"
      :name="itemFavorite.name"
      :active="selectedJID && itemFavorite.jid.equals(selectedJID)"
    )

  list-disclosure(
    @toggle="onGroupsToggle"
    :expanded="layout.sidebar.sections.groups"
    :list-class="disclosureListClass"
    title="Direct Messages"
    expanded
  )
    template(
      v-for="room in itemDirectMessages"
    )
      template(
        v-if="!itemFavoriteRawJIDs.has(room.id)"
      )
        sidebar-main-item-user(
          v-if="room.type === roomType.DirectMessage"
          :jid="room.members[0]?.jid"
          :name="room.name"
          :active="room.id === selectedRoomID"
        )

        sidebar-main-item-channel(
          v-if="room.type === roomType.Group"
          :id="room.id"
          :name="room.name"
          :active="room.id === selectedRoomID"
          type="group"
        )

    sidebar-main-item-add(
      @click="onDirectMessageAddClick"
      title="Open a direct message"
    )

  list-disclosure(
    @toggle="onChannelsToggle"
    :expanded="layout.sidebar.sections.channels"
    :list-class="disclosureListClass"
    title="Channels"
    expanded
  )
    sidebar-main-item-channel(
      v-for="room in itemChannels"
      :id="room.id"
      :name="room.name"
      :active="room.id === selectedRoomID"
      type="channel"
    )

    sidebar-main-item-add(
      @click="onChannelsAddClick"
      title="Add channels"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import {
  JID,
  Room,
  RoomType,
  Group as RosterGroup
} from "@prose-im/prose-sdk-js";

// PROJECT: COMPOSABLES
import { useEvents } from "@/composables/events";

// PROJECT: STORES
import Store from "@/store";
import { RosterList } from "@/store/tables/roster";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: COMPONENTS
import SidebarMainItemAdd from "@/components/sidebar/SidebarMainItemAdd.vue";
import SidebarMainItemChannel from "@/components/sidebar/SidebarMainItemChannel.vue";
import SidebarMainItemSection from "@/components/sidebar/SidebarMainItemSection.vue";
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";

// PROJECT: MODALS
import { Mode as AddContactMode } from "@/modals/sidebar/AddContact.vue";

// INTERFACES
interface RosterDisplayItem {
  jid: JID;
  name: string;
}

export default {
  name: "SidebarMain",

  components: {
    SidebarMainItemUser,
    SidebarMainItemChannel,
    SidebarMainItemSection,
    SidebarMainItemAdd
  },

  props: {
    disclosureListClass: {
      type: String,
      default: null
    }
  },

  emits: ["addContact"],

  data() {
    return {
      // --> DATA <--

      roomType: RoomType,

      // --> STATE <--

      selectedJID: null as JID | null,
      selectedRoomID: null as string | null,

      isRosterSyncStale: true,
      isRosterLoading: false
    };
  },

  computed: {
    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    itemFavoriteRawJIDs(): Set<string> {
      const favoriteJIDs: Set<string> = new Set([]);

      this.itemFavorites.forEach(itemFavorite => {
        favoriteJIDs.add(itemFavorite.jid.toString());
      });

      return favoriteJIDs;
    },

    itemFavorites(): RosterDisplayItem[] {
      return this.intoRosterDisplayItems(
        Store.$roster.getList(RosterGroup.Favorite)
      );
    },

    itemDirectMessages(): Room[] {
      return Store.$room.getDirectMessages();
    },

    itemChannels(): Room[] {
      return Store.$room.getChannels();
    }
  },

  watch: {
    $route: {
      immediate: true,

      handler(value) {
        if (
          value.name &&
          value.name.startsWith("app.inbox") === true &&
          value.params.roomId
        ) {
          this.selectedRoomID = value.params.roomId;

          // Opportunistic JID extrapolation from room identifier (if room is \
          //   a JID)
          try {
            this.selectedJID = new JID(value.params.roomId);
          } catch (_) {
            this.selectedJID = null;
          }
        } else {
          this.selectedRoomID = null;
          this.selectedJID = null;
        }
      }
    }
  },

  created() {
    // Bind session event handlers
    useEvents(Store.$session, {
      connected: this.onStoreConnected
    });

    // Bind room event handlers
    useEvents(Store.$room, {
      "rooms:changed": this.onRoomsChanged
    });

    // Bind roster event handlers
    useEvents(Store.$roster, {
      "contact:changed": this.onContactChanged
    });

    // Synchronize roster eagerly
    this.syncRosterEager();
  },

  methods: {
    // --> HELPERS <--

    async syncRosterEager(forceReload = false): Promise<void> {
      // Can synchronize now? (connected)
      if (
        this.isRosterSyncStale === true &&
        Store.$session.connected === true
      ) {
        // Mark synchronization as non-stale
        this.isRosterSyncStale = false;

        // Load roster
        this.isRosterLoading = true;

        await Store.$roster.load(forceReload);

        this.isRosterLoading = false;
      }
    },

    intoRosterDisplayItems(list: RosterList): Array<RosterDisplayItem> {
      return list.map(item => {
        return {
          jid: new JID(item.jid),
          name: item.name
        };
      });
    },

    // --> EVENT LISTENERS <--

    onSpotlightToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionSpotlight(visible);
    },

    onFavoritesToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionFavorites(visible);
    },

    onDirectMessageAddClick(): void {
      // Request to show add contact modal (in member mode)
      this.$emit("addContact", AddContactMode.Member);
    },

    onChannelsAddClick(): void {
      // Request to show add contact modal (in channel mode)
      this.$emit("addContact", AddContactMode.Channel);
    },

    onGroupsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionGroups(visible);
    },

    onChannelsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionChannels(visible);
    },

    async onStoreConnected(connected: boolean): Promise<void> {
      if (connected === true) {
        // Synchronize roster eagerly
        await Broker.$room.startObservingRooms();
      } else {
        // Mark synchronization as stale (will re-synchronize when connection \
        //   is restored)
        this.isRosterSyncStale = true;
      }
    },

    onRoomsChanged(): void {
      // Mark roster as state (should reload)
      this.isRosterSyncStale = true;

      // Forcibly reload roster
      this.syncRosterEager(true);
    },

    onContactChanged(): void {
      // Mark roster as state (should reload)
      this.isRosterSyncStale = true;

      // Forcibly reload roster
      this.syncRosterEager(true);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-main";

.c-sidebar-main {
  > * {
    margin-block-end: 15px;

    &:last-child {
      margin-block-end: 0;
    }
  }
}
</style>
