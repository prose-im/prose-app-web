<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-sidebar-context
  layout-avatar-presence(
    class="c-sidebar-context__avatar"
    :presence-class="avatarPresenceClass"
  )
    template(
      v-slot:avatar
    )
      base-avatar(
        @click="onAvatarImageClick"
        :jid="jid"
        size="32px"
        shadow="light"
        class="c-sidebar-context__avatar-image"
      )

      base-popover-list(
        v-if="isAvatarPopoverVisible"
        v-click-away="onAvatarPopoverClickAway"
        :items="avatarPopoverItems"
        class="c-sidebar-context__avatar-popover"
      )

    template(
      v-slot:presence
    )
      base-presence(
        v-if="this.session.connected"
        :jid="jid"
        size="small"
      )

  .c-sidebar-context__current
    p.c-sidebar-context__team.u-bold
      | Crisp

    p.c-sidebar-context__status
      span.c-sidebar-context__status-icon
        | 🚀

      span.c-sidebar-context__status-text
        | Building new features.

  base-action(
    @click="onActionsClick"
    :active="isActionsPopoverVisible"
    icon="ellipsis"
    context="grey"
    rotate="90deg"
    size="16px"
    class="c-sidebar-context__actions"
    auto-width
  )
    base-popover-list(
      v-if="isActionsPopoverVisible"
      v-click-away="onActionsPopoverClickAway"
      :items="actionsPopoverItems"
      class="c-sidebar-context__actions-popover"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@xmpp/jid";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import SidebarContextAccount from "@/components/sidebar/SidebarContextAccount.vue";
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "SidebarContext",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    avatarPresenceClass: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      // --> STATE <--

      isAvatarPopoverVisible: false,
      isActionsPopoverVisible: false
    };
  },

  computed: {
    avatarPopoverItems(): Array<PopoverItem> {
      return [
        {
          type: PopoverItemType.Component,
          target: SidebarContextAccount,

          properties: {
            type: "user",
            name: "Baptiste Jamin",
            address: this.jid.toString()
          }
        },

        {
          type: PopoverItemType.Button,
          label: "🚀 Update mood"
        },

        {
          type: PopoverItemType.Button,
          label: "Change availability",

          children: [
            {
              type: PopoverItemType.Button,
              label: "Available for chat"
            },

            {
              type: PopoverItemType.Button,
              label: "Do not disturb"
            }
          ]
        },

        {
          type: PopoverItemType.Button,
          label: "Pause notifications",

          children: [
            {
              type: PopoverItemType.Button,
              label: "For 10 minutes"
            },

            {
              type: PopoverItemType.Button,
              label: "For 1 hour"
            },

            {
              type: PopoverItemType.Button,
              label: "For 3 hours"
            },

            {
              type: PopoverItemType.Button,
              label: "For 1 day"
            },

            {
              type: PopoverItemType.Button,
              label: "Custom…"
            }
          ]
        },

        {
          type: PopoverItemType.Divider
        },

        {
          type: PopoverItemType.Button,
          label: "Edit profile"
        },

        {
          type: PopoverItemType.Button,
          label: "Account settings"
        },

        {
          type: PopoverItemType.Divider
        },

        {
          type: PopoverItemType.Button,
          label: "Sign me out",
          color: "red",
          emphasis: true,
          click: this.onAvatarPopoverSignOutClick
        }
      ];
    },

    actionsPopoverItems(): Array<PopoverItem> {
      return [
        {
          type: PopoverItemType.Component,
          target: SidebarContextAccount,

          properties: {
            type: "server",
            name: "Crisp",
            address: "crisp.chat"
          }
        },

        {
          type: PopoverItemType.Button,
          label: "Switch account",

          children: [
            {
              type: PopoverItemType.Button,
              label: "Crisp – crisp.chat"
            },

            {
              type: PopoverItemType.Button,
              label: "MakAir – makair.life"
            }
          ]
        },

        {
          type: PopoverItemType.Button,
          label: "Connect account"
        }
      ];
    },

    session(): typeof Store.$session {
      return Store.$session;
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onAvatarImageClick(): void {
      // Toggle popover
      this.isAvatarPopoverVisible = !this.isAvatarPopoverVisible;
    },

    onAvatarPopoverClickAway(): void {
      // Close popover
      this.isAvatarPopoverVisible = false;
    },

    async onAvatarPopoverSignOutClick(): Promise<void> {
      await Store.$account.logout();

      // Show confirm alert
      BaseAlert.info("Signed out", "Successfully signed out");

      // Redirect to login
      this.$router.push({
        name: "start.login"
      });
    },

    onActionsClick(): void {
      // Toggle popover
      this.isActionsPopoverVisible = !this.isActionsPopoverVisible;
    },

    onActionsPopoverClickAway(): void {
      // Close popover
      this.isActionsPopoverVisible = false;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-context";

.c-sidebar-context {
  display: flex;
  align-items: center;

  #{$c}__avatar {
    margin-inline-end: 13px;
    flex: 0 0 auto;
    position: relative;

    #{$c}__avatar-image {
      cursor: pointer;

      &:hover {
        filter: brightness(105%);
      }

      &:active {
        filter: brightness(98%);
      }
    }

    #{$c}__avatar-popover {
      position: absolute;
      inset-inline-start: $size-sidebar-popover-inset-inline-side;
      inset-block-end: calc(
        100% + #{$size-base-popover-list-inset-block-edge-offset}
      );
      z-index: 1;
    }
  }

  #{$c}__current {
    flex: 1;

    #{$c}__team {
      color: $color-text-primary;
      font-size: 14px;
    }

    #{$c}__status {
      margin-block-start: 4px;

      #{$c}__status-icon {
        font-size: 15px;
        margin-inline-end: 5px;
      }

      #{$c}__status-text {
        color: $color-text-secondary;
        font-size: 13px;

        &:before {
          content: "“";
        }

        &:after {
          content: "”";
        }
      }
    }
  }

  #{$c}__actions {
    margin-inline-start: 6px;
    margin-inline-end: (-1 * $size-base-action-padding-sides);
    flex: 0 0 auto;

    #{$c}__actions-popover {
      position: absolute;
      inset-inline-end: $size-sidebar-popover-inset-inline-side;
      inset-block-end: calc(
        100% + #{$size-base-popover-list-inset-block-edge-offset}
      );
      z-index: 1;
    }
  }
}
</style>
