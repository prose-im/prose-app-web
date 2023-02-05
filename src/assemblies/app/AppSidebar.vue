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
  sidebar-header(
    :class=`[
      "a-app-sidebar__header",
      {
        "a-app-sidebar__header--floating": isHeaderFloating
      }
    ]`
  )

  sidebar-main(
    @scroll="onMainScroll"
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
import SidebarHeader from "@/components/sidebar/SidebarHeader.vue";
import SidebarMain from "@/components/sidebar/SidebarMain.vue";
import SidebarContext from "@/components/sidebar/SidebarContext.vue";

// CONSTANTS
const MAIN_SCROLLED_THRESHOLD_VERTICAL = 16;

export default {
  name: "AppSidebar",

  components: { SidebarHeader, SidebarMain, SidebarContext },

  data() {
    return {
      // --> STATES <--

      isHeaderFloating: false
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onMainScroll(event: object): void {
      const forceFloating =
        event.target.scrollTop >= MAIN_SCROLLED_THRESHOLD_VERTICAL;

      // Update floating marker? (only if changed)
      if (forceFloating !== this.isHeaderFloating) {
        this.isHeaderFloating = forceFloating;
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-app-sidebar";

// VARIABLES
$sidebar-items-padding-sides: 20px;
$sidebar-main-padding-block: 16px;
$sidebar-header-border-width: 1px;
$sidebar-header-height: $size-inbox-topbar-height;
$sidebar-context-border-width: 1px;
$sidebar-context-height: $size-inbox-form-height;

.a-app-sidebar {
  position: relative;

  &,
  #{$c}__context #{$c}__context-presence {
    background-color: $color-base-purple-ultra-light;
  }

  #{$c}__header,
  #{$c}__main,
  #{$c}__context {
    padding-inline: $sidebar-items-padding-sides;
  }

  #{$c}__header,
  #{$c}__context {
    background-color: rgba($color-base-purple-ultra-light, 0.9);
    position: absolute;
    inset-inline: 0;
    backdrop-filter: blur(9px);
  }

  #{$c}__context:before,
  #{$c}__header:after {
    content: "";
    height: $size-layout-gradient-height;
    position: absolute;
    inset-inline: 0;
    pointer-events: none;
  }

  #{$c}__header {
    border-block-end: $sidebar-header-border-width solid transparent;
    height: $sidebar-header-height;
    inset-block-start: 0;
    z-index: 1;
    transition: border-color 100ms linear;

    &:after {
      background-image: linear-gradient(
        0deg,
        rgba($color-black, 0) 0%,
        rgba($color-black, 0.015) 100%
      );
      inset-block-start: calc(100% + 1px);
      display: none;
    }

    &--floating {
      border-block-end-color: $color-border-secondary;

      &:after {
        display: block;
      }
    }
  }

  #{$c}__main {
    padding-block-start: (
      $sidebar-main-padding-block + $sidebar-header-height +
        $sidebar-header-border-width
    );
    padding-block-end: (
      $sidebar-main-padding-block + $sidebar-context-height +
        $sidebar-context-border-width
    );
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
    border-block-start: $sidebar-context-border-width solid
      $color-border-secondary;
    height: $sidebar-context-height;
    inset-block-end: 0;
    z-index: 2;

    &:before {
      background-image: linear-gradient(
        180deg,
        rgba($color-black, 0) 0%,
        rgba($color-black, 0.01) 100%
      );
      inset-block-end: calc(100% + 1px);
    }
  }
}
</style>
