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
    :list-class="disclosureListClass"
    title="Spotlight"
    expanded
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
    :list-class="disclosureListClass"
    title="Favorites"
    expanded
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
