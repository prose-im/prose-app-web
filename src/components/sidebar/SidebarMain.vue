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
    list-item
      | Unread stack

    list-item
      | Replies

    list-item
      | Direct messages

    list-item
      | People & groups

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

    list-item
      | Add a member

  list-disclosure(
    :list-class="disclosureListClass"
    title="Other contacts"
  )
    sidebar-main-item-user(
      jid="remi@prose.org"
      name="Rémi"
    )

    list-item
      | Connect with someone

  list-disclosure(
    :list-class="disclosureListClass"
    title="Groups"
    expanded
  )
    list-item
      | bugs

    list-item
      | constellation

    list-item
      | general

    list-item
      | support

    list-item
      | Add a group
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";

export default {
  name: "SidebarMain",

  components: { SidebarMainItemUser },

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

// VARIABLES
/* TODO */

.c-sidebar-main {
  #{$c}__item {
    #{$c}__item-avatar {
      display: block;
    }
  }
}
</style>
