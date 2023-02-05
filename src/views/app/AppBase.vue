<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.v-app-base
  .v-app-base__sidebar
    sidebar-main(
      class="v-app-base__sidebar-main"
      disclosure-list-class="v-app-base__sidebar-main-list"
    )

    sidebar-context(
      class="v-app-base__sidebar-context"
      avatar-presence-class="v-app-base__sidebar-context-presence"
    )

  .v-app-base__content
    router-view
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import SidebarMain from "@/components/sidebar/SidebarMain.vue";
import SidebarContext from "@/components/sidebar/SidebarContext.vue";

export default {
  name: "AppBase",

  components: { SidebarMain, SidebarContext }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-base";

// VARIABLES
$sidebar-items-padding-sides: 20px;
$sidebar-main-padding-block: 20px;
$sidebar-context-height: $size-inbox-form-height;

.v-app-base {
  height: 100%;
  width: 100%;
  display: flex;

  #{$c}__sidebar,
  #{$c}__sidebar-context #{$c}__sidebar-context-presence {
    background-color: $color-base-purple-ultra-light;
  }

  #{$c}__sidebar {
    border-inline-end: 1px solid $color-border-secondary;
    width: 300px;
    flex: 0 0 auto;
    position: relative;

    #{$c}__sidebar-main,
    #{$c}__sidebar-context {
      padding-inline: $sidebar-items-padding-sides;
    }

    #{$c}__sidebar-main {
      padding-block-start: $sidebar-main-padding-block;
      padding-block-end: (
        $sidebar-main-padding-block + $sidebar-context-height
      );
      overflow-x: hidden;
      overflow-y: auto;
      position: absolute;
      inset: 0;
      z-index: 0;

      #{$c}__sidebar-main-list {
        margin-inline: (-1 * $sidebar-items-padding-sides);

        > * {
          padding-inline: $sidebar-items-padding-sides;
        }
      }
    }

    #{$c}__sidebar-context {
      background-color: rgba($color-base-purple-ultra-light, 0.9);
      border-block-start: 1px solid $color-border-secondary;
      height: $sidebar-context-height;
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      z-index: 1;
      backdrop-filter: blur(9px);

      &:before {
        content: "";
        background-image: linear-gradient(
          180deg,
          rgba($color-black, 0) 0%,
          rgba($color-black, 0.01) 100%
        );
        height: 6px;
        position: absolute;
        inset-inline: 0;
        inset-block-end: calc(100% + 1px);
        pointer-events: none;
      }
    }
  }

  #{$c}__content {
    flex: 1;
  }
}
</style>
