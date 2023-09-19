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
    @toggle="onFavoritesToggle"
    :expanded="layout.sidebar.sections.favorites"
    :list-class="disclosureListClass"
    title="Favorites"
  )
    sidebar-main-item-user(
      v-for="itemFavorite in itemFavorites"
      :jid="itemFavorite.jid"
      :name="itemFavorite.name"
      :active="activeJID && itemFavorite.jid.equals(activeJID)"
    )

  list-disclosure(
    @toggle="onTeamMembersToggle"
    :expanded="layout.sidebar.sections.teamMembers"
    :list-class="disclosureListClass"
    title="Team members"
    expanded
  )
    sidebar-main-item-user(
      v-for="itemTeamMember in itemTeamMembers"
      :jid="itemTeamMember.jid"
      :name="itemTeamMember.name"
      :active="activeJID && itemTeamMember.jid.equals(activeJID)"
    )

    sidebar-main-item-add(
      @click="onTeamMembersAddClick"
      title="Add a member"
    )

  list-disclosure(
    @toggle="onOtherContactsToggle"
    :expanded="layout.sidebar.sections.otherContacts"
    :list-class="disclosureListClass"
    title="Other contacts"
  )
    sidebar-main-item-user(
      v-for="itemOtherContact in itemOtherContacts"
      :jid="itemOtherContact.jid"
      :name="itemOtherContact.name"
      :active="activeJID && itemOtherContact.jid.equals(activeJID)"
    )

    sidebar-main-item-add(
      @click="onOtherContactsAddClick"
      title="Connect with someone"
    )

  list-disclosure(
      @toggle="onGroupsToggle"
      :expanded="layout.sidebar.sections.groups"
      :list-class="disclosureListClass"
      title="Groups"
      expanded
    )
      sidebar-main-item-channel(
        v-for="channel in itemGroups"
        :id="channel.room.id"
        :name="channel.room.name"
        :active="channel.room.id === selectedRoomID"
      )

      sidebar-main-item-add(
        title="Add a channel"
        disabled
      )

  list-disclosure(
    @toggle="onChannelsToggle"
    :expanded="layout.sidebar.sections.channels"
    :list-class="disclosureListClass"
    title="Channels"
    expanded
  )
    sidebar-main-item-channel(
      v-for="channel in itemPublicChannels"
      :id="channel.room.id"
      :name="channel.room.name"
      :active="channel.room.id === selectedRoomID"
    )

    sidebar-main-item-add(
      title="Add a channel"
      disabled
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
import { JID, Group as RosterGroup } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";
import { RosterList, SidebarRoomEntry } from "@/store/tables/roster";

import Broker from "@/broker";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";
import SidebarMainItemChannel from "@/components/sidebar/SidebarMainItemChannel.vue";
import SidebarMainItemSection from "@/components/sidebar/SidebarMainItemSection.vue";
import SidebarMainItemAdd from "@/components/sidebar/SidebarMainItemAdd.vue";

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
      // --> STATE <--

      activeJID: null as JID | null,
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

    itemFavorites(): RosterDisplayItem[] {
      return this.intoRosterDisplayItems(
        Store.$roster.getList(RosterGroup.Favorite)
      );
    },

    itemTeamMembers(): RosterDisplayItem[] {
      return this.intoRosterDisplayItems(
        Store.$roster.getList(RosterGroup.Team)
      );
    },

    itemOtherContacts(): RosterDisplayItem[] {
      return this.intoRosterDisplayItems(
        Store.$roster.getList(RosterGroup.Other)
      );
    },

    itemGroups(): SidebarRoomEntry[] {
      return Store.$roster.getGroups();
    },

    itemPublicChannels(): SidebarRoomEntry[] {
      return Store.$roster
        .getPublicChannels()
        .concat(Store.$roster.getPrivateChannels());
    }
  },

  watch: {
    $route: {
      immediate: true,

      handler(value) {
        if (value.name && value.name.startsWith("app.inbox")) {
          if (value.params.jid) {
            this.activeJID = new JID(value.params.jid);
          } else if (value.params.roomID) {
            this.selectedRoomID = value.params.roomID;
          }
        } else {
          this.activeJID = null;
        }
      }
    }
  },

  created() {
    // TODO: put this in a utility helper

    // Bind connected handler
    Store.$session.events().on("connected", this.onStoreConnected);
    Store.$roster.events().on("rooms:changed", this.onRoomsChanged);

    // Synchronize roster eagerly
    this.syncRosterEager();
  },

  beforeUnmount() {
    // Unbind connected handler
    Store.$session.events().off("connected", this.onStoreConnected);
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

    onTeamMembersToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionTeamMembers(visible);
    },

    onTeamMembersAddClick(): void {
      this.modals.addContact.mode = AddContactMode.Member;
      this.modals.addContact.visible = true;
    },

    onOtherContactsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionOtherContacts(visible);
    },

    onOtherContactsAddClick(): void {
      this.modals.addContact.mode = AddContactMode.Other;
      this.modals.addContact.visible = true;
    },

    onGroupsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionGroups(visible);
    },

    onChannelsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionGroups(visible);
    },

    async onStoreConnected(connected: boolean): Promise<void> {
      if (connected === true) {
        // Synchronize roster eagerly
        await Broker.$roster.startObservingRooms();
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

    async onModalAddContactAdd(jid: JID, name: string): Promise<void> {
      if (this.modals.addContact.loading !== true) {
        this.modals.addContact.loading = true;

        try {
          // Add contact
          // TODO: await Broker.$contact.addContact(jid, name);

          BaseAlert.success("Contact added", "Contact has been added");

          this.modals.addContact.visible = false;
        } catch (error) {
          this.$log.error("Failed adding contact", error);

          BaseAlert.error("Contact not added", `${name} could not be added`);
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
