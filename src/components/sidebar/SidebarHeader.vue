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
    base-tooltip(
      :bypassed="isIdentityPopoverVisible"
      align="left"
      direction="bottom"
      tooltip="Manage Workspace"
    )
      base-server-logo(
        @click="onIdentityLogoClick"
        class="c-sidebar-header__identity-logo"
        domain="prose.org"
        size="30px"
      )

    base-popover-list(
      v-if="isIdentityPopoverVisible"
      v-click-away="onIdentityPopoverClickAway"
      :items="identityPopoverItems"
      class="c-sidebar-header__identity-popover"
    )

  layout-actions(
    class="c-sidebar-header__actions"
  )
    base-tooltip(
      align="right"
      direction="bottom"
      tooltip="Call Someone"
    )
      base-action(
        class="c-sidebar-header__action"
        icon="phone.bubble.left"
        size="18px"
        disabled
      )

    base-tooltip(
      align="right"
      direction="bottom"
      tooltip="Message Someone"
    )
      base-action(
        class="c-sidebar-header__action"
        icon="square.and.pencil"
        size="18px"
        disabled
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";

// PROJECT: MODALS
import { AddContactMode as SidebarAddContactMode } from "@/assemblies/app/AppSidebar.vue";

export default {
  name: "SidebarHeader",

  emits: ["addContact"],

  data() {
    return {
      // --> STATE <--

      isIdentityPopoverVisible: false
    };
  },

  computed: {
    identityPopoverItems(): Array<PopoverItem> {
      return [
        {
          type: PopoverItemType.Button,
          label: "Invite people",
          click: this.onIdentityPopoverInvitePeopleClick
        },

        {
          type: PopoverItemType.Button,
          label: "Create a channel",
          click: this.onIdentityPopoverCreateChannelClick
        },

        {
          type: PopoverItemType.Divider
        },

        {
          type: PopoverItemType.Button,
          label: "Manage server",
          emphasis: true,
          disabled: true
        }
      ];
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onIdentityLogoClick(): void {
      // Toggle popover
      this.isIdentityPopoverVisible = !this.isIdentityPopoverVisible;
    },

    onIdentityPopoverClickAway(): void {
      // Close popover
      this.isIdentityPopoverVisible = false;
    },

    onIdentityPopoverInvitePeopleClick(): void {
      // Request to show add contact modal (in member mode)
      this.$emit("addContact", SidebarAddContactMode.Member);
    },

    onIdentityPopoverCreateChannelClick(): void {
      // Request to show add contact modal (in channel mode)
      this.$emit("addContact", SidebarAddContactMode.Channel);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-header";

#{$c} {
  display: flex;
  align-items: center;

  #{$c}__identity {
    line-height: 0;
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
        100% + #{$size-base-popover-list-inset-block-edge-offset}
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
