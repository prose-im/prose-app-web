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
        jid="baptiste@prose.org"
        size="32px"
        shadow="light"
        class="c-sidebar-context__avatar-image"
      )

      base-popover-list(
        v-if="isAvatarPopoverVisible"
        :items="avatarPopoverItems"
        class="c-sidebar-context__avatar-popover"
      )

    template(
      v-slot:presence
    )
      base-presence(
        type="available"
        show="chat"
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

  .c-sidebar-context__actions
    base-action(
      @click="onActionsClick"
      :active="isActionsPopoverVisible"
      icon="ellipsis"
      context="grey"
      rotate="90deg"
      size="16px"
      auto-width
    )

    base-popover-list(
      v-if="isActionsPopoverVisible"
      :items="actionsPopoverItems"
      class="c-sidebar-context__actions-popover"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SidebarContext",

  props: {
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
    avatarPopoverItems() {
      return [
        {
          type: "button",
          label: "🚀 Update mood"
        },

        {
          type: "button",
          label: "Change availability"
        },

        {
          type: "button",
          label: "Pause notifications"
        },

        {
          type: "divider"
        },

        {
          type: "button",
          label: "Edit profile"
        },

        {
          type: "button",
          label: "Account settings"
        },

        {
          type: "divider"
        },

        {
          type: "button",
          label: "Offline mode"
        },

        {
          type: "divider"
        },

        {
          type: "button",
          label: "Sign me out",
          color: "red",
          emphasis: true
        }
      ];
    },

    actionsPopoverItems() {
      return [
        {
          type: "button",
          label: "Switch account"
        },

        {
          type: "button",
          label: "Connect account"
        },

        {
          type: "divider"
        },

        {
          type: "button",
          label: "Manage server",
          emphasis: true
        }
      ];
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onAvatarImageClick() {
      // Toggle popover
      this.isAvatarPopoverVisible = !this.isAvatarPopoverVisible;
    },

    onActionsClick() {
      // Toggle popover
      this.isActionsPopoverVisible = !this.isActionsPopoverVisible;
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
        100% + #{$size-sidebar-popover-inset-block-edge-offset}
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
    position: relative;

    #{$c}__actions-popover {
      position: absolute;
      inset-inline-end: $size-sidebar-popover-inset-inline-side;
      inset-block-end: calc(
        100% + #{$size-sidebar-popover-inset-block-edge-offset}
      );
      z-index: 1;
    }
  }
}
</style>
