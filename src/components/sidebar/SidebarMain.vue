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
    sidebar-main-section(
      @click="onSectionUnreadClick"
      :translucent="translucent"
      :active="sectionActive.unread"
      title="Unread stack"
      icon="tray.2"
    )

    sidebar-main-section(
      @click="onSectionBrowseClick"
      :translucent="translucent"
      :active="sectionActive.browse"
      :count="sectionCount.browse"
      title="People & channels"
      icon="text.book.closed"
    )

  list-disclosure(
    v-if="itemFavorites.length > 0"
    @toggle="onFavoritesToggle"
    :expanded="layout.sidebar.sections.favorites"
    :list-class="disclosureListClass"
    title="Favorites"
  )
    sidebar-main-item(
      v-for="item in itemFavorites"
      :item="item"
      :jid="jid"
      :selection="selectedRoomID"
      :translucent="translucent"
    )

  list-disclosure(
    @toggle="onGroupsToggle"
    :expanded="layout.sidebar.sections.groups"
    :list-class="disclosureListClass"
    title="Direct Messages"
    expanded
  )
    sidebar-main-item(
      v-for="item in itemDirectMessages"
      :item="item"
      :jid="jid"
      :selection="selectedRoomID"
      :translucent="translucent"
    )

    sidebar-main-action-add(
      @click="onDirectMessageAddClick"
      title="Open a direct message"
      :translucent="translucent"
    )

  list-disclosure(
    @toggle="onChannelsToggle"
    :expanded="layout.sidebar.sections.channels"
    :list-class="disclosureListClass"
    title="Channels"
    expanded
  )
    sidebar-main-item(
      v-for="item in itemChannels"
      :item="item"
      :jid="jid"
      :selection="selectedRoomID"
      :translucent="translucent"
    )

    sidebar-main-action-add(
      @click="onChannelsAddClick"
      title="Add a channel"
      :translucent="translucent"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, SidebarItem } from "@prose-im/prose-sdk-js";

// PROJECT: COMPOSABLES
import { useEvents } from "@/composables/events";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: COMPONENTS
import SidebarMainSection from "@/components/sidebar/SidebarMainSection.vue";
import SidebarMainItem from "@/components/sidebar/SidebarMainItem.vue";
import SidebarMainActionAdd from "@/components/sidebar/SidebarMainActionAdd.vue";

// PROJECT: MODALS
import { AddContactMode as SidebarAddContactMode } from "@/assemblies/app/AppSidebar.vue";

export default {
  name: "SidebarMain",

  components: {
    SidebarMainSection,
    SidebarMainItem,
    SidebarMainActionAdd
  },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    translucent: {
      type: Boolean,
      default: false
    },

    disclosureListClass: {
      type: String,
      default: null
    }
  },

  emits: ["addContact"],

  data() {
    return {
      // --> STATE <--

      selectedJID: null as JID | null,
      selectedRoomID: null as string | null,

      syncStaleness: {
        rooms: true,
        channels: true,
        contacts: true,
        blockList: true,
        requests: true
      } as { [entry: string]: boolean }
    };
  },

  computed: {
    routeName(): string {
      return typeof this.$route.name === "string" ? this.$route.name : "";
    },

    sectionActive(): { [section: string]: boolean } {
      return {
        unread: this.routeName === "app.spotlight.unread",
        browse: this.routeName.startsWith("app.spotlight.browse")
      };
    },

    sectionCount(): { [section: string]: number } {
      return {
        browse: this.presenceRequests.length
      };
    },

    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    itemFavorites(): Array<SidebarItem> {
      return Store.$room.getItemFavorites();
    },

    itemDirectMessages(): Array<SidebarItem> {
      return Store.$room.getItemDirectMessages();
    },

    itemChannels(): Array<SidebarItem> {
      return Store.$room.getItemChannels();
    },

    presenceRequests(): ReturnType<typeof Store.$presence.getRequests> {
      return Store.$presence.getRequests();
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

    // Bind channel event handlers
    useEvents(Store.$channel, {
      "channels:changed": this.onChannelsChanged
    });

    // Bind roster event handlers
    useEvents(Store.$roster, {
      "contacts:changed": this.onContactsChanged,
      "blocklist:changed": this.onBlockListChanged
    });

    // Bind presence event handlers
    useEvents(Store.$presence, {
      "requests:changed": this.onRequestsChanged
    });

    // Synchronize eagerly
    this.syncAllEager();
  },

  methods: {
    // --> HELPERS <--

    async syncAllEager(expunge = false): Promise<void> {
      await Promise.all([
        this.syncRoomsEager(expunge),
        this.syncContactsEager(expunge),
        this.syncBlockListEager(expunge),
        this.syncChannelsEager(expunge),
        this.syncRequestsEager(expunge)
      ]);
    },

    async syncRoomsEager(expunge = false): Promise<void> {
      await this.syncGenericEager(
        "rooms",
        expunge,

        async () => {
          await Store.$room.load(expunge);
        }
      );
    },

    async syncContactsEager(expunge = false): Promise<void> {
      await this.syncGenericEager(
        "contacts",
        expunge,

        async () => {
          await Store.$roster.loadContacts(expunge);
        }
      );
    },

    async syncBlockListEager(expunge = false): Promise<void> {
      await this.syncGenericEager(
        "blockList",
        expunge,

        async () => {
          await Store.$roster.loadBlockList(expunge);
        }
      );
    },

    async syncChannelsEager(expunge = false): Promise<void> {
      await this.syncGenericEager(
        "channels",
        expunge,

        async () => {
          await Store.$channel.load(expunge);
        }
      );
    },

    async syncRequestsEager(expunge = false): Promise<void> {
      await this.syncGenericEager(
        "requests",
        expunge,

        async () => {
          await Store.$presence.loadRequests(expunge);
        }
      );
    },

    async syncGenericEager(
      entry: string,
      expunge: boolean,
      load: (expunge: boolean) => Promise<void>
    ): Promise<void> {
      // Can synchronize now? (connected)
      if (
        this.syncStaleness[entry] === true &&
        Store.$session.connected === true
      ) {
        // Mark synchronization as non-stale
        this.syncStaleness[entry] = false;

        // Load entries
        await load(expunge);
      }
    },

    // --> EVENT LISTENERS <--

    onSpotlightToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionSpotlight(visible);
    },

    onFavoritesToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionFavorites(visible);
    },

    onSectionUnreadClick(): void {
      this.$router.push({
        name: "app.spotlight.unread"
      });
    },

    onSectionBrowseClick(): void {
      this.$router.push({
        name: "app.spotlight.browse"
      });
    },

    onDirectMessageAddClick(): void {
      // Request to show add contact modal (in member mode)
      this.$emit("addContact", SidebarAddContactMode.Member);
    },

    onChannelsAddClick(): void {
      // Request to show add contact modal (in channel mode)
      this.$emit("addContact", SidebarAddContactMode.Channel);
    },

    onGroupsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionGroups(visible);
    },

    onChannelsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionChannels(visible);
    },

    async onStoreConnected(connected: boolean): Promise<void> {
      if (connected === true) {
        // Start observing rooms
        await Broker.$room.startObservingRooms();

        // Forcibly reload everything (since we just became connected)
        await this.syncAllEager(true);
      } else {
        // Mark synchronization as stale (will re-synchronize when connection \
        //   is restored, since we just became disconnected)
        // Notice: do not mark channels as stale, since we do not want to \
        //   reload them everytime we reconnect since it could be quite heavy, \
        //   and not so useful. Browsing channels in the dedicated section \
        //   would forcibly reload them all everytime, which is good enough \
        //   to catch up with newly-created channels on apps with large uptimes.
        this.syncStaleness.rooms = true;
        this.syncStaleness.contacts = true;
        this.syncStaleness.blockList = true;
      }
    },

    onRoomsChanged(): void {
      // Mark rooms as stale (should reload)
      this.syncStaleness.rooms = true;

      // Forcibly reload rooms
      this.syncRoomsEager(true);
    },

    onChannelsChanged(): void {
      // Mark channels as stale (should reload)
      this.syncStaleness.channels = true;

      // Forcibly reload channels
      this.syncChannelsEager(true);
    },

    onContactsChanged(): void {
      // Mark contacts as stale (should reload)
      this.syncStaleness.contacts = true;

      // Forcibly reload contacts
      this.syncContactsEager(true);
    },

    onBlockListChanged(): void {
      // Mark block list as stale (should reload)
      this.syncStaleness.blockList = true;

      // Forcibly reload block list
      this.syncBlockListEager(true);
    },

    onRequestsChanged(): void {
      // Mark requests as stale (should reload)
      this.syncStaleness.requests = true;

      // Forcibly reload requests
      this.syncRequestsEager(true);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-main";

#{$c} {
  > * {
    margin-block-end: 15px;

    &:last-child {
      margin-block-end: 0;
    }
  }
}
</style>
