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
      title="Add a member"
      disabled
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
      title="Connect with someone"
      disabled
    )

  list-disclosure(
    @toggle="onGroupsToggle"
    :expanded="layout.sidebar.sections.groups"
    :list-class="disclosureListClass"
    title="Groups"
    expanded
  )
    sidebar-main-item-channel(
      name="bugs"
      disabled
    )

    sidebar-main-item-channel(
      name="constellation"
      disabled
    )

    sidebar-main-item-channel(
      name="general"
      disabled
    )

    sidebar-main-item-channel(
      name="support"
      disabled
    )

    sidebar-main-item-add(
      title="Add a group"
      disabled
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID } from "@prose-im/prose-core-client-wasm";

// PROJECT: STORES
import Store from "@/store";
import { RosterList } from "@/store/tables/roster";

// PROJECT: COMPONENTS
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";
import SidebarMainItemChannel from "@/components/sidebar/SidebarMainItemChannel.vue";
import SidebarMainItemSection from "@/components/sidebar/SidebarMainItemSection.vue";
import SidebarMainItemAdd from "@/components/sidebar/SidebarMainItemAdd.vue";

// PROJECT: BROKER
import { RosterItemGroup } from "@/broker/modules/roster";

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

  data() {
    return {
      // --> STATE <--

      activeJID: null,

      isRosterSyncStale: true,
      isRosterLoading: false
    };
  },

  computed: {
    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    itemFavorites(): RosterList {
      return this.intoRosterDisplayItems(
        Store.$roster.getList(RosterItemGroup.Favorite)
      );
    },

    itemTeamMembers(): RosterList {
      return this.intoRosterDisplayItems(
        Store.$roster.getList(RosterItemGroup.Team)
      );
    },

    itemOtherContacts(): RosterList {
      return this.intoRosterDisplayItems(
        Store.$roster.getList(RosterItemGroup.Other)
      );
    }
  },

  watch: {
    $route: {
      immediate: true,

      handler(value) {
        if (value.name && value.name.startsWith("app.inbox")) {
          this.activeJID = new JID(value.params.jid);
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
    Store.$roster.events().on("contact:changed", this.onContactChanged);

    // Synchronize roster eagerly
    this.syncRosterEager();
  },

  beforeUnmount() {
    // Unbind connected handler
    Store.$session.events().off("connected", this.onStoreConnected);
  },

  methods: {
    // --> HELPERS <--

    async syncRosterEager(): void {
      // Can synchronize now? (connected)
      if (
        this.isRosterSyncStale === true &&
        Store.$session.connected === true
      ) {
        // Mark synchronization as non-stale
        this.isRosterSyncStale = false;

        // Load roster
        this.isRosterLoading = true;

        await Store.$roster.load();

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

    onOtherContactsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionOtherContacts(visible);
    },

    onGroupsToggle(visible: boolean): void {
      Store.$layout.setSidebarSectionGroups(visible);
    },

    onStoreConnected(connected: boolean): void {
      if (connected === true) {
        // Synchronize roster eagerly
        this.syncRosterEager();
      } else {
        // Mark synchronization as stale (will re-synchronize when connection \
        //   is restored)
        this.isRosterSyncStale = true;
      }
    },

    onContactChanged(jid: JID): void {
      this.isRosterSyncStale = true;
      this.syncRosterEager();
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
