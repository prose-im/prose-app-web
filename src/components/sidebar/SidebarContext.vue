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

    p.c-sidebar-context__status(
      v-if="statusActivity.status"
    )
      span.c-sidebar-context__status-icon
        | {{ statusActivity.status.icon }}

      span.c-sidebar-context__status-text(
        v-if="statusActivity.status.text"
      )
        | {{ statusActivity.status.text }}

    p.c-sidebar-context__status(
      v-else
    )
      a.c-sidebar-context__status-define(
        @click="onCurrentStatusDefineClick"
      )
        | Set your status

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

  update-status(
    v-if="modals.updateStatus.visible"
    :jid="jid"
    :loading="modals.updateStatus.loading"
    @update="onModalUpdateStatusUpdate"
    @clear="onModalUpdateStatusClear"
    @close="onModalUpdateStatusClose"
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
import UpdateStatus from "@/modals/sidebar/UpdateStatus.vue";
import SignOut from "@/modals/sidebar/SignOut.vue";

// PROJECT: POPUPS
import EditProfile from "@/popups/sidebar/EditProfile.vue";
import AccountSettings from "@/popups/sidebar/AccountSettings.vue";

// PROJECT: BROKER
import Broker from "@/broker";
import { PresenceShow } from "@/broker/stanzas/presence";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "SidebarContext",

  components: { UpdateStatus, SignOut, EditProfile, AccountSettings },

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
        updateStatus: {
          visible: false,
          loading: false
        },

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

          label: `${
            this.statusActivity.status ? this.statusActivity.status.icon : "🙂"
          } Update status`,

          click: this.onAvatarPopoverUpdateStatusClick
        },

        {
          type: PopoverItemType.Button,
          label: "Change availability",

          children: [
            {
              type: PopoverItemType.Button,
              label: "Available",
              click: this.onAvatarPopoverAvailabilityAvailableClick,
              emphasis: this.presenceLocalShow === undefined
            },

            {
              type: PopoverItemType.Button,
              label: "Busy (Do not disturb)",
              click: this.onAvatarPopoverAvailabilityBusyClick,
              emphasis: this.presenceLocalShow === PresenceShow.DoNotDisturb
            },

            {
              type: PopoverItemType.Button,
              label: "Away (Invisible)",
              click: this.onAvatarPopoverAvailabilityAwayClick,
              emphasis: this.presenceLocalShow === PresenceShow.ExtendedAway
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

    presenceLocalShow(): ReturnType<typeof Store.$presence.getLocalShow> {
      return Store.$presence.getLocalShow();
    },

    statusActivity(): ReturnType<typeof Store.$activity.getActivity> {
      return Store.$activity.getActivity(this.jid);
    },

    session(): typeof Store.$session {
      return Store.$session;
    }
  },

  methods: {
    // --> HELPERS <--

    toggleAvatarPopoverAvailability(
      show?: PresenceShow,
      alertText?: string
    ): void {
      if (this.presenceLocalShow !== show) {
        // Store last selected availability
        Store.$presence.setLocalShow(show);

        // Send Do Not Disturb presence
        Broker.$status.sendPresence(show);

        // Show confirm alert?
        if (alertText !== undefined) {
          BaseAlert.info("Availability changed", alertText);
        }
      }
    },

    // --> EVENT LISTENERS <--

    onAvatarImageClick(): void {
      // Toggle popover
      this.isAvatarPopoverVisible = !this.isAvatarPopoverVisible;
    },

    onAvatarPopoverClickAway(): void {
      // Close popover
      this.isAvatarPopoverVisible = false;
    },

    onAvatarPopoverUpdateStatusClick(): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      // Show update status modal
      this.modals.updateStatus.visible = true;
    },

    onAvatarPopoverAvailabilityAvailableClick(): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      // Toggle availability
      this.toggleAvatarPopoverAvailability(
        undefined,
        "You are now seen as available"
      );
    },

    onAvatarPopoverAvailabilityBusyClick(): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      // Toggle availability ('Do Not Disturb' goes for 'Busy')
      this.toggleAvatarPopoverAvailability(
        PresenceShow.DoNotDisturb,
        "You are now seen as busy"
      );
    },

    onAvatarPopoverAvailabilityAwayClick(): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      // Toggle availability ('Extended Away' goes for 'Invisible')
      this.toggleAvatarPopoverAvailability(
        PresenceShow.ExtendedAway,
        "You are now invisible"
      );
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

    onCurrentStatusDefineClick(): void {
      // Show update status modal
      this.modals.updateStatus.visible = true;
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

    async onModalUpdateStatusUpdate(
      icon: string,
      text?: string
    ): Promise<void> {
      if (this.modals.updateStatus.loading !== true) {
        this.modals.updateStatus.loading = true;

        try {
          // Send updated activity status
          await Broker.$status.sendActivity(icon, text);

          BaseAlert.success(
            "Status updated",
            "Other users will now your new status"
          );

          this.modals.updateStatus.visible = false;
        } catch (error) {
          this.$log.error("Failed updating status", error);

          BaseAlert.error(
            "Status not updated",
            "Status failed to save. Try again?"
          );
        } finally {
          this.modals.updateStatus.loading = false;
        }
      }
    },

    async onModalUpdateStatusClear(): Promise<void> {
      if (this.modals.updateStatus.loading !== true) {
        this.modals.updateStatus.loading = true;

        try {
          // Send blank activity status
          await Broker.$status.sendActivity();

          BaseAlert.info(
            "Status cleared",
            "Users will not see your status anymore"
          );

          this.modals.updateStatus.visible = false;
        } catch (error) {
          this.$log.error("Failed clearing status", error);

          BaseAlert.error(
            "Status not cleared",
            "Status failed to reset. Try again?"
          );
        } finally {
          this.modals.updateStatus.loading = false;
        }
      }
    },

    onModalUpdateStatusClose(): void {
      this.modals.updateStatus.visible = false;
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

// VARIABLES
$current-status-define-padding-sides: 5px;

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

      #{$c}__status-text,
      #{$c}__status-define {
        font-size: 13px;
      }

      #{$c}__status-icon {
        font-size: 15px;
        margin-inline-end: 5px;
      }

      #{$c}__status-text {
        color: $color-text-secondary;

        &:before {
          content: "“";
        }

        &:after {
          content: "”";
        }
      }

      #{$c}__status-define {
        color: $color-base-purple-normal;
        margin-inline: (-1 * $current-status-define-padding-sides);
        padding: 2px $current-status-define-padding-sides;
        border-radius: 3px;
        transition: background-color 100ms linear;

        &:hover {
          background-color: darken($color-base-grey-light, 3%);
        }

        &:active {
          background-color: darken($color-base-grey-light, 5%);
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
