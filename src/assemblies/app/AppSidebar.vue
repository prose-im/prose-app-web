<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.a-app-sidebar
  sidebar-main(
    class="a-app-sidebar__main"
    disclosure-list-class="a-app-sidebar__main-list"
  )

  sidebar-context(
    class="a-app-sidebar__context"
    avatar-presence-class="a-app-sidebar__context-presence"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import SidebarMain from "@/components/sidebar/SidebarMain.vue";
import SidebarContext from "@/components/sidebar/SidebarContext.vue";

export default {
  name: "AppSidebar",

  components: { SidebarMain, SidebarContext }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-app-sidebar";

// VARIABLES
$sidebar-items-padding-sides: 20px;
$sidebar-main-padding-block: 20px;
$sidebar-context-height: $size-inbox-form-height;

.a-app-sidebar {
  position: relative;

  &,
  #{$c}__context #{$c}__context-presence {
    background-color: $color-base-purple-ultra-light;
  }

  #{$c}__main,
  #{$c}__context {
    padding-inline: $sidebar-items-padding-sides;
  }

  #{$c}__main {
    padding-block-start: $sidebar-main-padding-block;
    padding-block-end: ($sidebar-main-padding-block + $sidebar-context-height);
    overflow-x: hidden;
    overflow-y: auto;
    position: absolute;
    inset: 0;
    z-index: 0;

    #{$c}__main-list {
      margin-inline: (-1 * $sidebar-items-padding-sides);

      > * {
        padding-inline: $sidebar-items-padding-sides;
      }
    }
  }

  #{$c}__context {
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
</style>
