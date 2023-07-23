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
      | (no team)

    p.c-sidebar-context__status
      span.c-sidebar-context__status-icon
        | 👨‍💻

      span.c-sidebar-context__status-text
        | (no activity)

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

  sign-out(
    v-if="modals.signOut.visible"
    @proceed="onModalSignOutProceed"
    @close="onModalSignOutClose"
  )

  edit-profile(
    v-if="popups.editProfile.visible"
    @close="onPopupEditProfileClose"
  )

  account-settings(
    v-if="popups.accountSettings.visible"
    @close="onPopupAccountSettingsClose"
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

// PROJECT: MODALS
import SignOut from "@/modals/sidebar/SignOut.vue";

// PROJECT: POPUPS
import EditProfile from "@/popups/sidebar/EditProfile.vue";
import AccountSettings from "@/popups/sidebar/AccountSettings.vue";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "SidebarContext",

  components: { SignOut, EditProfile, AccountSettings },

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
      isActionsPopoverVisible: false,

      modals: {
        signOut: {
          visible: false
        }
      },

      popups: {
        editProfile: {
          visible: false
        },

        accountSettings: {
          visible: false
        }
      }
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
            name: this.jid.local,
            address: this.jid.toString()
          }
        },

        {
          type: PopoverItemType.Button,
          label: "🚀 Update mood",
          disabled: true
        },

        {
          type: PopoverItemType.Button,
          label: "Change availability",

          children: [
            {
              type: PopoverItemType.Button,
              label: "Available for chat",
              click: this.onAvatarPopoverAvailabilityAvailableClick
            },

            {
              type: PopoverItemType.Button,
              label: "Do not disturb",
              click: this.onAvatarPopoverAvailabilityDoNotDisturbClick
            }
          ]
        },

        {
          type: PopoverItemType.Button,
          label: "Pause notifications",
          disabled: true,

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
          label: "Edit profile",
          click: this.onAvatarPopoverEditProfileClick
        },

        {
          type: PopoverItemType.Button,
          label: "Account settings",
          click: this.onAvatarPopoverAccountSettingsClick
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
            name: "Prose",
            address: "prose.org"
          }
        },

        {
          type: PopoverItemType.Button,
          label: "Switch account",
          disabled: true,

          children: [
            {
              type: PopoverItemType.Button,
              label: "Prose – prose.org"
            }
          ]
        },

        {
          type: PopoverItemType.Button,
          label: "Connect account",
          disabled: true
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

    onAvatarPopoverAvailabilityAvailableClick(): void {
      // TODO: change availability
      console.error("==> onAvatarPopoverAvailabilityAvailableClick");
    },

    onAvatarPopoverAvailabilityDoNotDisturbClick(): void {
      // TODO: change availability
      console.error("==> onAvatarPopoverAvailabilityDoNotDisturbClick");
    },

    onAvatarPopoverEditProfileClick(): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      // Show edit profile popup
      this.popups.editProfile.visible = true;
    },

    onAvatarPopoverAccountSettingsClick(): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      // Show account settings popup
      this.popups.accountSettings.visible = true;
    },

    onAvatarPopoverSignOutClick(): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      // Show sign out confirm modal
      this.modals.signOut.visible = true;
    },

    onActionsClick(): void {
      // Toggle popover
      this.isActionsPopoverVisible = !this.isActionsPopoverVisible;
    },

    onActionsPopoverClickAway(): void {
      // Close popover
      this.isActionsPopoverVisible = false;
    },

    onPopupEditProfileClose(): void {
      this.popups.editProfile.visible = false;
    },

    onPopupAccountSettingsClose(): void {
      this.popups.accountSettings.visible = false;
    },

    async onModalSignOutProceed(): Promise<void> {
      // Logout from account
      await Store.$account.logout();

      // Reset all stores
      Store.reset();

      // Redirect to login
      await this.$router.push({
        name: "start.login"
      });

      // Show confirm alert
      BaseAlert.info("Signed out", "Successfully signed out");
    },

    onModalSignOutClose(): void {
      this.modals.signOut.visible = false;
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
