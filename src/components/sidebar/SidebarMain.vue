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
    )

    sidebar-main-item-section(
      title="Replies"
      icon="arrowshape.turn.up.left.2"
    )

    sidebar-main-item-section(
      title="Direct messages"
      icon="message"
    )

    sidebar-main-item-section(
      title="People & groups"
      icon="text.book.closed"
    )

  list-disclosure(
    @toggle="onFavoritesToggle"
    :expanded="layout.sidebar.sections.favorites"
    :list-class="disclosureListClass"
    title="Favorites"
  )
    sidebar-main-item-user(
      jid="valerian@prose.org"
      name="Valerian"
      active
    )

    sidebar-main-item-user(
      jid="julien@prose.org"
      name="Julien"
    )

  list-disclosure(
    @toggle="onTeamMembersToggle"
    :expanded="layout.sidebar.sections.teamMembers"
    :list-class="disclosureListClass"
    title="Team members"
    expanded
  )
    sidebar-main-item-user(
      jid="marc@prose.org"
      name="Marc"
    )

    sidebar-main-item-user(
      jid="saif@prose.org"
      name="Saif"
    )

    sidebar-main-item-user(
      jid="guillaume@prose.org"
      name="Guillaume"
    )

    sidebar-main-item-add(
      title="Add a member"
    )

  list-disclosure(
    @toggle="onOtherContactsToggle"
    :expanded="layout.sidebar.sections.otherContacts"
    :list-class="disclosureListClass"
    title="Other contacts"
  )
    sidebar-main-item-user(
      jid="remi@prose.org"
      name="Rémi"
    )

    sidebar-main-item-add(
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
      name="bugs"
    )

    sidebar-main-item-channel(
      name="constellation"
    )

    sidebar-main-item-channel(
      name="general"
    )

    sidebar-main-item-channel(
      name="support"
    )

    sidebar-main-item-add(
      title="Add a group"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";
import SidebarMainItemChannel from "@/components/sidebar/SidebarMainItemChannel.vue";
import SidebarMainItemSection from "@/components/sidebar/SidebarMainItemSection.vue";
import SidebarMainItemAdd from "@/components/sidebar/SidebarMainItemAdd.vue";

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

  computed: {
    layout(): typeof Store.$layout {
      return Store.$layout;
    }
  },

  methods: {
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
