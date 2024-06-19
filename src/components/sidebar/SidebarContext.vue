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
  base-tooltip(
    :bypassed="isAvatarPopoverVisible"
    align="left"
    click="hide"
    tooltip="Manage Account"
    class="c-sidebar-context__avatar-wrap"
  )
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
          @close="onAvatarPopoverClose"
          :items="avatarPopoverItems"
          :translucent="translucent"
          class="c-sidebar-context__avatar-popover"
        )

      template(
        v-if="this.session.connected"
        v-slot:presence
      )
        base-presence(
          :jid="jid"
          size="small"
        )

  .c-sidebar-context__current
    p.c-sidebar-context__team.u-bold.u-ellipsis
      | {{ teamName }}

    p.c-sidebar-context__status(
      v-if="statusActivity.status"
    )
      span.c-sidebar-context__status-icon
        | {{ statusActivity.status.icon }}

      span.c-sidebar-context__status-text.u-ellipsis(
        v-if="statusActivity.status.text"
        :title="statusActivity.status.text"
      )
        | {{ statusActivity.status.text }}

    p.c-sidebar-context__status(
      v-else
    )
      a.c-sidebar-context__status-define(
        @click="onCurrentStatusDefineClick"
      )
        | Set your status

  base-tooltip(
    :bypassed="isActionsPopoverVisible"
    align="right"
    click="hide"
    tooltip="More Options"
    class="c-sidebar-context__actions-wrap"
  )
    base-action(
      @click="onActionsClick"
      :translucent="translucent"
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
        @close="onActionsPopoverClose"
        :items="actionsPopoverItems"
        :translucent="translucent"
        class="c-sidebar-context__actions-popover"
      )

  update-status(
    v-if="modals.updateStatus.visible"
    @update="onModalUpdateStatusUpdate"
    @clear="onModalUpdateStatusClear"
    @close="onModalUpdateStatusClose"
    :jid="jid"
    :loading="modals.updateStatus.loading"
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
import { JID, Availability } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import BasePresence from "@/components/base/BasePresence.vue";
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

// PROJECT: COMPOSABLES
import { useEvents } from "@/composables/events";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: STORES
import Store from "@/store";

// CONSTANTS
const TEN_MINUTES_TO_MILLISECONDS = 600000; // 10 minutes
const ONE_HOUR_TO_MILLISECONDS = 3600000; // 1 hour
const THREE_HOURS_TO_MILLISECONDS = 10800000; // 3 hours
const ONE_DAY_TO_MILLISECONDS = 86400000; // 1 day
const ONE_WEEK_TO_MILLISECONDS = 604800000; // 1 week

const AVATAR_POPOVER_AVAILABILITY_ICON_SIZE = "small";

export default {
  name: "SidebarContext",

  components: { UpdateStatus, SignOut, EditProfile, AccountSettings },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    translucent: {
      type: Boolean,
      default: false
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
      const items = [];

      items.push(
        {
          type: PopoverItemType.Component,
          target: SidebarContextAccount,

          properties: {
            type: "user",
            name: this.selfName,
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
              emphasis: this.localAvailabilityStates.available,
              active: this.localAvailabilityStates.available,

              icon: {
                component: BasePresence,

                properties: {
                  availability: Availability.Available,
                  size: AVATAR_POPOVER_AVAILABILITY_ICON_SIZE,
                  active: this.localAvailabilityStates.available
                }
              }
            },

            {
              type: PopoverItemType.Button,
              label: "Busy (Do not disturb)",
              click: this.onAvatarPopoverAvailabilityBusyClick,
              emphasis: this.localAvailabilityStates.busy,
              active: this.localAvailabilityStates.busy,

              icon: {
                component: BasePresence,

                properties: {
                  availability: Availability.DoNotDisturb,
                  size: AVATAR_POPOVER_AVAILABILITY_ICON_SIZE,
                  active: this.localAvailabilityStates.busy
                }
              }
            },

            {
              type: PopoverItemType.Button,
              label: "Away (Invisible)",
              click: this.onAvatarPopoverAvailabilityAwayClick,
              emphasis: this.localAvailabilityStates.away,
              active: this.localAvailabilityStates.away,

              icon: {
                component: BasePresence,

                properties: {
                  availability: Availability.Away,
                  size: AVATAR_POPOVER_AVAILABILITY_ICON_SIZE,
                  active: this.localAvailabilityStates.away
                }
              }
            }
          ]
        }
      );

      // Append resume or pause notifications action
      if (this.notificationsPausedUntil !== null) {
        items.push({
          type: PopoverItemType.Button,

          label: `Alerts paused (${this.$filters.date.timeLeft(
            this.notificationsPausedUntil,
            true
          )})`,

          click: this.onAvatarPopoverResumeNotificationsClick,
          emphasis: true,
          color: "lighter",

          icon: {
            name: "bell.slash"
          }
        });
      } else {
        items.push({
          type: PopoverItemType.Button,
          label: "Pause notifications",

          children: [
            {
              type: PopoverItemType.Button,
              label: "For 10 minutes",
              click: this.onAvatarPopoverPauseNotificationsTenMinutesClick
            },

            {
              type: PopoverItemType.Button,
              label: "For 1 hour",
              click: this.onAvatarPopoverPauseNotificationsOneHourClick
            },

            {
              type: PopoverItemType.Button,
              label: "For 3 hours",
              click: this.onAvatarPopoverPauseNotificationsThreeHoursClick
            },

            {
              type: PopoverItemType.Button,
              label: "For 1 day",
              click: this.onAvatarPopoverPauseNotificationsOneDayClick
            },

            {
              type: PopoverItemType.Button,
              label: "For 1 week",
              click: this.onAvatarPopoverPauseNotificationsOneWeekClick
            }
          ]
        });
      }

      items.push(
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
      );

      return items;
    },

    actionsPopoverItems(): Array<PopoverItem> {
      return [
        {
          type: PopoverItemType.Component,
          target: SidebarContextAccount,

          properties: {
            type: "server",
            name: this.teamName,
            address: this.teamDomain
          }
        },

        {
          type: PopoverItemType.Button,
          label: "Switch account",
          disabled: true,

          children: [
            {
              type: PopoverItemType.Button,
              label: `${this.teamName} – ${this.teamDomain}`
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

    teamDomain(): string {
      return this.jid.domain;
    },

    teamName(): string {
      return `@${this.teamDomain}`;
    },

    localAvailability(): ReturnType<
      typeof Store.$account.getInformationAvailability
    > {
      return Store.$account.getInformationAvailability();
    },

    localAvailabilityStates(): { [state: string]: boolean } {
      return {
        available: this.localAvailability === Availability.Available,
        busy: this.localAvailability === Availability.DoNotDisturb,
        away: this.localAvailability === Availability.Away
      };
    },

    selfName(): string {
      return Store.$account.getInformationName();
    },

    statusActivity(): ReturnType<typeof Store.$activity.getActivity> {
      return Store.$activity.getActivity(this.jid);
    },

    notificationsPausedUntil(): number | null {
      const untilTimestamp = Store.$settings.notifications.pause.until || 0;

      if (untilTimestamp > 0 && untilTimestamp > Date.now()) {
        return untilTimestamp;
      }

      return null;
    },

    session(): typeof Store.$session {
      return Store.$session;
    }
  },

  created() {
    // Bind session event handlers
    useEvents(Store.$session, {
      "request:popup": this.onStoreRequestPopup
    });
  },

  methods: {
    // --> HELPERS <--

    toggleAvatarPopoverAvailability(
      availability: Availability,
      alertText?: string
    ): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      if (this.localAvailability !== availability) {
        // Store last selected availability
        Store.$account.setInformationAvailability(availability);

        // Send Do Not Disturb presence
        Broker.$status.setAvailability(availability);

        // Show confirm alert?
        if (alertText !== undefined) {
          BaseAlert.info("Availability changed", alertText);
        }
      }
    },

    toggleAvatarPopoverPauseNotifications(
      duration = -1,
      alertTextTime?: string
    ): void {
      // Hide avatar popover
      this.isAvatarPopoverVisible = false;

      if (duration >= 0) {
        const nowTime = Date.now();

        // Store paused notifications date (in future)
        Store.$settings.setNotificationsPauseUntil(nowTime + duration);

        // Show confirm alert
        BaseAlert.info(
          "Notifications paused",
          `Alerts will be muted for ${alertTextTime || "some time"}`
        );
      } else {
        // Store cleared paused notifications date
        Store.$settings.setNotificationsPauseUntil(null);

        // Show confirm alert
        BaseAlert.info("Notifications unpaused", "Alerts have been resumed");
      }
    },

    // --> EVENT LISTENERS <--

    onStoreRequestPopup({ target }: { target: string }): void {
      switch (target) {
        case "settings": {
          // Request to open account settings (alias click event)
          this.onAvatarPopoverAccountSettingsClick();

          break;
        }

        case "profile": {
          // Request to open profile editor (alias click event)
          this.onAvatarPopoverEditProfileClick();

          break;
        }
      }
    },

    onAvatarImageClick(): void {
      // Toggle popover
      this.isAvatarPopoverVisible = !this.isAvatarPopoverVisible;
    },

    onAvatarPopoverClose(): void {
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
      // Toggle availability
      this.toggleAvatarPopoverAvailability(
        Availability.Available,
        "You are now seen as available"
      );
    },

    onAvatarPopoverAvailabilityBusyClick(): void {
      // Toggle availability ('Do Not Disturb' goes for 'Busy')
      this.toggleAvatarPopoverAvailability(
        Availability.DoNotDisturb,
        "You are now seen as busy"
      );
    },

    onAvatarPopoverAvailabilityAwayClick(): void {
      // Toggle availability ('Extended Away' goes for 'Invisible')
      this.toggleAvatarPopoverAvailability(
        Availability.Away,
        "You are now invisible"
      );
    },

    onAvatarPopoverPauseNotificationsTenMinutesClick(): void {
      // Toggle pause notifications timer date (to 10 minutes)
      this.toggleAvatarPopoverPauseNotifications(
        TEN_MINUTES_TO_MILLISECONDS,
        "10 minutes"
      );
    },

    onAvatarPopoverPauseNotificationsOneHourClick(): void {
      // Toggle pause notifications timer date (to 1 hour)
      this.toggleAvatarPopoverPauseNotifications(
        ONE_HOUR_TO_MILLISECONDS,
        "1 hour"
      );
    },

    onAvatarPopoverPauseNotificationsThreeHoursClick(): void {
      // Toggle pause notifications timer date (to 3 hours)
      this.toggleAvatarPopoverPauseNotifications(
        THREE_HOURS_TO_MILLISECONDS,
        "3 hours"
      );
    },

    onAvatarPopoverPauseNotificationsOneDayClick(): void {
      // Toggle pause notifications timer date (to 1 day)
      this.toggleAvatarPopoverPauseNotifications(
        ONE_DAY_TO_MILLISECONDS,
        "1 day"
      );
    },

    onAvatarPopoverPauseNotificationsOneWeekClick(): void {
      // Toggle pause notifications timer date (to 1 week)
      this.toggleAvatarPopoverPauseNotifications(
        ONE_WEEK_TO_MILLISECONDS,
        "1 week"
      );
    },

    onAvatarPopoverResumeNotificationsClick(): void {
      // Toggle pause notifications timer date (resume)
      this.toggleAvatarPopoverPauseNotifications();
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

    onActionsPopoverClose(): void {
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

      // Show confirm alert
      BaseAlert.info("Signed out", "Successfully signed out");

      // Hide sign out modal
      this.modals.signOut.visible = false;

      // Make sure that sign out modal is hidden, then redirect to login
      // Important: failure to remove the sign out modal from the DOM will \
      //   induce a general Vue error due to the teleport target (ie. #app) \
      //   being destroyed, then re-created with a different DOM reference. \
      //   This explains why we need to wait for $nextTick() before redirecting.
      this.$nextTick(async () => {
        // Redirect to login
        await this.$router.push({
          name: "start.login"
        });
      });
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
$current-status-define-padding-inline: 5px;
$current-status-define-padding-block: 2px;

#{$c} {
  display: flex;
  align-items: center;

  #{$c}__avatar-wrap {
    flex: 0 0 auto;
    display: inline-flex;

    #{$c}__avatar {
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
  }

  #{$c}__current {
    line-height: 16px;
    margin-inline-start: (13px - $current-status-define-padding-inline);
    margin-inline-end: (6px - $current-status-define-padding-inline);
    padding-inline: $current-status-define-padding-inline;
    padding-block: $current-status-define-padding-block;
    flex: 1;
    overflow: hidden;

    #{$c}__team {
      color: rgb(var(--color-text-primary));
      font-size: 14px;
      margin-block-start: -1px;
    }

    #{$c}__status {
      margin-block-start: 4px;
      display: flex;
      align-items: center;

      #{$c}__status-text,
      #{$c}__status-define {
        font-size: 13px;
      }

      #{$c}__status-icon {
        font-size: 15px;
        flex: 0 0 auto;
      }

      #{$c}__status-text {
        color: rgb(var(--color-text-secondary));
        margin-inline-start: 5px;

        &:before {
          content: "“";
        }

        &:after {
          content: "”";
        }
      }

      #{$c}__status-define {
        color: rgb(var(--color-base-purple-normal));
        margin-inline: -$current-status-define-padding-inline;
        margin-block: -$current-status-define-padding-block;
        padding: $current-status-define-padding-block
          $current-status-define-padding-inline;
        border-radius: 3px;
        transition: background-color 100ms linear;

        &:hover {
          background-color: darken-var(var(--color-base-grey-light), 3%);
        }

        &:active {
          background-color: darken-var(var(--color-base-grey-light), 5%);
        }
      }
    }
  }

  #{$c}__actions-wrap {
    flex: 0 0 auto;
    margin-inline-end: -$size-base-action-padding-sides;

    #{$c}__actions {
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
}
</style>
