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
    list-item
    list-item
    list-item

  list-disclosure(
    :list-class="disclosureListClass"
    title="Favorites"
    expanded
  )
    list-item
    list-item

  list-disclosure(
    :list-class="disclosureListClass"
    title="Team members"
    expanded
  )
    list-item
    list-item
    list-item
    list-item

  list-disclosure(
    :list-class="disclosureListClass"
    title="Other contacts"
  )
    list-item
    list-item

  list-disclosure(
    :list-class="disclosureListClass"
    title="Groups"
    expanded
  )
    list-item
    list-item
    list-item
    list-item
    list-item
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SidebarMain",

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
  /* TODO */
}
</style>
