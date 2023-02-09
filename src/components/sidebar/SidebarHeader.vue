<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-sidebar-header
  .c-sidebar-header__identity
    base-server-logo(
      @click="onIdentityLogoClick"
      class="c-sidebar-header__identity-logo"
      domain="crisp.chat"
      size="30px"
    )

    base-popover-list(
      v-if="isIdentityPopoverVisible"
      :items="identityPopoverItems"
      class="c-sidebar-header__identity-popover"
    )

  layout-actions(
    class="c-sidebar-header__actions"
  )
    base-action(
      class="c-sidebar-header__action"
      icon="phone.bubble.left"
      size="18px"
    )

    base-action(
      class="c-sidebar-header__action"
      icon="square.and.pencil"
      size="18px"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SidebarHeader",

  data() {
    return {
      // --> STATE <--

      isIdentityPopoverVisible: false
    };
  },

  computed: {
    identityPopoverItems() {
      return [
        {
          type: "button",
          label: "Invite workspace members"
        },

        {
          type: "button",
          label: "Create a group"
        },

        {
          type: "divider"
        },

        {
          type: "button",
          label: "Server administration"
        }
      ];
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onIdentityLogoClick() {
      // Toggle popover
      this.isIdentityPopoverVisible = !this.isIdentityPopoverVisible;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-header";

.c-sidebar-header {
  display: flex;
  align-items: center;

  #{$c}__identity {
    flex: 1;
    position: relative;

    #{$c}__identity-logo {
      cursor: pointer;
      display: block;

      &:hover {
        filter: brightness(105%);
      }

      &:active {
        filter: brightness(98%);
      }
    }

    #{$c}__identity-popover {
      position: absolute;
      inset-inline-start: $size-sidebar-popover-inset-inline-side;
      inset-block-start: calc(
        100% + #{$size-sidebar-popover-inset-block-edge-offset}
      );
      z-index: 1;
    }
  }

  #{$c}__actions {
    margin-inline-start: 6px;
    margin-inline-end: (-1 * ($size-base-action-padding-sides - 1px));
    flex: 0 0 auto;
  }
}
</style>
