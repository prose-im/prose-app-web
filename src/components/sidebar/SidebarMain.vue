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

  add-contact(
    v-if="modals.addContact.visible"
    @add="onModalAddContactAdd"
    @close="onModalAddContactClose"
    :mode="modals.addContact.mode"
    :loading="modals.addContact.loading"
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

import Broker from "@/broker";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import SidebarMainItemAdd from "@/components/sidebar/SidebarMainItemAdd.vue";
import SidebarMainItemChannel from "@/components/sidebar/SidebarMainItemChannel.vue";
import SidebarMainItemSection from "@/components/sidebar/SidebarMainItemSection.vue";
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";

// PROJECT: MODALS
import {
  default as AddContact,
  Mode as AddContactMode
} from "@/modals/sidebar/AddContact.vue";

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
    SidebarMainItemAdd,
    AddContact
  },

  props: {
    disclosureListClass: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      // --> DATA <--

      roomType: RoomType,

      // --> STATE <--

      selectedJID: null as JID | null,
      selectedRoomID: null as string | null,

      isRosterSyncStale: true,
      isRosterLoading: false,

      modals: {
        addContact: {
          visible: false,
          loading: false,
          mode: null as AddContactMode | null
        }
      }
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
      return Store.$muc.getDirectMessages();
    },

    itemChannels(): Room[] {
      return Store.$muc.getChannels();
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

    // Bind MUC event handlers
    useEvents(Store.$muc, {
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

    async addContactGroup(jidString: string): Promise<void> {
      const jids = jidString.split(",").map(value => new JID(value.trim()));

      // Add contact
      await Broker.$muc.createGroup(jids);

      BaseAlert.success("Group added", "Group has been added");
    },

    async addContactChannel(jidString: string): Promise<void> {
      await Broker.$muc.createPublicChannel(jidString);

      BaseAlert.success("Channel added", "Channel has been added");
    },

    // --> EVENT LISTENERS <--

    onSpotlightToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionSpotlight(visible);
    },

    onFavoritesToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionFavorites(visible);
    },

    onDirectMessageAddClick(): void {
      this.modals.addContact.mode = AddContactMode.Member;
      this.modals.addContact.visible = true;
    },

    onChannelsAddClick(): void {
      this.modals.addContact.mode = AddContactMode.Channel;
      this.modals.addContact.visible = true;
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
        await Broker.$muc.startObservingRooms();
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
    },

    async onModalAddContactAdd(jidString: string): Promise<void> {
      if (this.modals.addContact.loading !== true) {
        this.modals.addContact.loading = true;

        try {
          switch (this.modals.addContact.mode) {
            case AddContactMode.Member:
              await this.addContactGroup(jidString);

              break;

            case AddContactMode.Channel:
              await this.addContactChannel(jidString);

              break;
          }

          this.modals.addContact.visible = false;
        } catch (error) {
          BaseAlert.error(
            "Contact not added",
            `${jidString} could not be added`
          );

          this.$log.error("Failed adding contact", error);
        } finally {
          this.modals.addContact.loading = false;
        }
      }
    },

    onModalAddContactClose(): void {
      this.modals.addContact.visible = false;
      this.modals.addContact.mode = null;
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
