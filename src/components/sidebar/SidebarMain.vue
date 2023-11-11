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
      v-for="item in itemFavorites"
      :jid="item.room.members[0]?.jid"
      :name="item.name"
      :unread="item.unreadCount"
      :error="item.error"
      :draft="item.hasDraft"
      :active="selectedJID && item.room.jid.equals(selectedJID)"
    )

  list-disclosure(
    @toggle="onGroupsToggle"
    :expanded="layout.sidebar.sections.groups"
    :list-class="disclosureListClass"
    title="Direct Messages"
    expanded
  )
    template(
      v-for="item in itemDirectMessages"
    )
      sidebar-main-item-user(
        v-if="item.room.type === roomType.DirectMessage"
        :jid="item.room.members[0]?.jid"
        :name="item.name"
        :unread="item.unreadCount"
        :error="item.error"
        :draft="item.hasDraft"
        :active="item.room.id === selectedRoomID"
      )

      sidebar-main-item-channel(
        v-else-if="item.room.type === roomType.Group"
        :id="item.room.id"
        :name="item.name"
        :unread="item.unreadCount"
        :error="item.error"
        :draft="item.hasDraft"
        :active="item.room.id === selectedRoomID"
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
      v-for="item in itemChannels"
      :id="item.room.id"
      :name="item.name"
      :unread="item.unreadCount"
      :error="item.error"
      :draft="item.hasDraft"
      :active="item.room.id === selectedRoomID"
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
import { JID, SidebarItem, RoomType } from "@prose-im/prose-sdk-js";

// PROJECT: COMPOSABLES
import { useEvents } from "@/composables/events";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: COMPONENTS
import SidebarMainItemAdd from "@/components/sidebar/SidebarMainItemAdd.vue";
import SidebarMainItemChannel from "@/components/sidebar/SidebarMainItemChannel.vue";
import SidebarMainItemSection from "@/components/sidebar/SidebarMainItemSection.vue";
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";

// PROJECT: MODALS
import { Mode as AddContactMode } from "@/modals/sidebar/AddContact.vue";

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

    itemFavorites(): SidebarItem[] {
      return Store.$room.getItemFavorites();
    },

    itemDirectMessages(): SidebarItem[] {
      return Store.$room.getItemDirectMessages();
    },

    itemChannels(): SidebarItem[] {
      return Store.$room.getItemChannels();
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
