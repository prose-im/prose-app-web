<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-toolbar(
  class="a-inbox-topbar"
  draggable
)
  template(
    v-slot:left
  )
    topbar-actions-history

  template(
    v-slot:middle
  )
    span.a-inbox-topbar__identity.a-inbox-topbar__identity--name(
      v-if="room"
    )
      base-tooltip(
        :tooltip="identityNamePresenceTooltip"
        direction="bottom"
        class="a-inbox-topbar__identity-badge"
      )
        base-presence(
          v-if="isDirectMessage"
          :jid="jid"
          size="medium"
          class="a-inbox-topbar__identity-badge-icon"
        )

      span.a-inbox-topbar__identity-value.u-bold
        | {{ room.name }}

      base-tooltip(
        direction="bottom"
        tooltip="Toggle favorite"
        class="a-inbox-topbar__identity-action"
      )
        base-icon(
          v-if="identityFavoriteIcon"
          @click="onIdentityActionFavoriteClick"
          :name="identityFavoriteIcon"
          size="14px"
          class="a-inbox-topbar__identity-action-icon"
        )

  template(
    v-slot:right
  )
    base-tooltip(
      :tooltip="originalJID"
      :bypassed="truncatedJID === originalJID"
      align="right"
      direction="bottom"
    )
      span(
        :class=`[
          "a-inbox-topbar__identity",
          "a-inbox-topbar__identity--jid",
          {
            "a-inbox-topbar__identity--has-jid": truncatedJID
          }
        ]`
      )
        base-action(
          @click="onIdentityBadgeVerificationClick"
          :icon="identityBadgeVerification.icon"
          :icon-class="'a-inbox-topbar__identity-badge-icon a-inbox-topbar__identity-badge-icon--' + identityBadgeVerification.status"
          class="a-inbox-topbar__identity-badge"
          size="16px"
        )

        span(
          v-if="truncatedJID"
          class="a-inbox-topbar__identity-value u-regular"
        )
          | {{ truncatedJID }}

    base-separator

    layout-actions
      base-tooltip(
        :tooltip="actionDetailsTooltip"
        align="right"
        direction="bottom"
      )
        base-action(
          @click="onActionDetailsClick"
          :active="layout.inbox.details.visible"
          icon="info.circle"
          context="grey"
          size="18px"
        )

    base-separator

    topbar-actions-search
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, Room, RoomType, Availability } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import TopbarActionsHistory from "@/components/topbar/TopbarActionsHistory.vue";
import TopbarActionsSearch from "@/components/topbar/TopbarActionsSearch.vue";

// PROJECT: COMPOSABLES
import { useInterfaceMounted } from "@/composables/interface";

// INTERFACES
interface IdentityBadge {
  status: string;
  icon: string;
}

// CONSTANTS
const JID_TRUNCATE_LENGTH = 15;

export default {
  name: "InboxTopbar",

  components: { TopbarActionsHistory, TopbarActionsSearch },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    room: {
      type: Object as PropType<Room>,
      default: undefined
    }
  },

  setup() {
    useInterfaceMounted((mounted: boolean) => {
      Store.$session.setInterfaceToolbarMounted(mounted);
    });
  },

  computed: {
    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    availability(): ReturnType<typeof Store.$presence.getAvailability> {
      return Store.$presence.getAvailability(this.jid);
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    },

    roomItem(): ReturnType<typeof Store.$room.getRoomItem> {
      return this.room ? Store.$room.getRoomItem(this.room.id) : undefined;
    },

    originalJID(): string {
      return this.jid.toString();
    },

    truncatedJID(): string | null {
      if (this.isDirectMessage === true) {
        let jid = this.originalJID;

        if (jid.length < JID_TRUNCATE_LENGTH) {
          return jid;
        }

        return jid.slice(0, JID_TRUNCATE_LENGTH - 1) + "…";
      }

      return null;
    },

    identityBadgeVerification(): IdentityBadge {
      // Identity verified?
      if (this.profile.security && this.profile.security.verification) {
        return {
          status: "verified",
          icon: "checkmark.seal.fill"
        };
      }

      // Identity unverified
      return {
        status: "unknown",
        icon: "xmark.seal.fill"
      };
    },

    identityFavoriteIcon(): string | null {
      if (this.roomItem !== undefined) {
        return this.roomItem.isFavorite === true ? "star.fill" : "star";
      }

      return null;
    },

    isDirectMessage(): boolean {
      return this.room?.type === RoomType.DirectMessage;
    },

    identityNamePresenceTooltip(): string {
      let tooltip = "",
        hasPrefix = false;

      // Append name?
      if (this.room?.name) {
        tooltip += `${this.room.name} is `;

        hasPrefix = true;
      }

      // Acquire availability label
      let availabilityLabel = "";

      switch (this.availability) {
        case Availability.Available: {
          availabilityLabel = "Available (Online)";

          break;
        }

        case Availability.DoNotDisturb: {
          availabilityLabel = "Busy (Do not disturb)";

          break;
        }

        default: {
          // Important: 'Away' is considered as 'Offline' since the user \
          //   wants to appear as invisible here (ie. offline).
          availabilityLabel = "Offline";
        }
      }

      // Append availability label
      // Notice: if a prefix is set (eg. 'Marc is [availability]'), then \
      //   lowercase availability label (ie. '[availability]').
      if (hasPrefix === true) {
        availabilityLabel = availabilityLabel.toLowerCase();
      }

      tooltip += availabilityLabel;

      return tooltip;
    },

    actionDetailsTooltip(): string {
      let detailsParts: Array<string> = [];

      // Append room type
      switch (this.room?.type) {
        case RoomType.DirectMessage: {
          detailsParts.push("User");

          break;
        }

        case RoomType.Group: {
          detailsParts.push("Group");

          break;
        }

        case RoomType.PrivateChannel:
        case RoomType.PublicChannel: {
          detailsParts.push("Channel");

          break;
        }
      }

      // Append tooltip suffix
      detailsParts.push("Details");

      return detailsParts.join(" ");
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onActionDetailsClick(): void {
      Store.$layout.toggleInboxDetailsVisible();
    },

    async onIdentityActionFavoriteClick(): Promise<void> {
      if (this.roomItem) {
        try {
          const wasFavorite = this.roomItem.isFavorite || false;

          // Toggle favorite mode
          await this.roomItem.toggleFavorite();

          // Acknowledge toggle
          BaseAlert.info(
            wasFavorite === true ? "Unset from favorites" : "Set as favorite",
            (wasFavorite === true ? "Removed from" : "Added to") + " favorites"
          );
        } catch (error) {
          // Alert of toggle error
          this.$log.error(
            `Could not toggle favorite status on room: ${this.roomItem.room.id}`,
            error
          );

          BaseAlert.error(
            "Cannot toggle favorite",
            "Failed changing favorite status. Try again?"
          );
        }
      }
    },

    onIdentityBadgeVerificationClick(): void {
      // TODO
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-topbar";

#{$c} {
  #{$c}__identity {
    display: flex;
    align-items: center;

    &--name {
      color: rgb(var(--color-text-primary));
      font-size: 16px;

      #{$c}__identity-badge,
      #{$c}__identity-action {
        margin-block-start: 1px;
      }

      #{$c}__identity-action {
        margin-inline-start: 8px;
      }
    }

    &--jid {
      color: rgb(var(--color-text-secondary));
      font-size: 15px;

      #{$c}__identity-badge {
        margin-inline-end: -($size-base-action-padding-sides + 2px);

        #{$c}__identity-badge-icon {
          &--verified {
            fill: rgb(var(--color-base-green-normal));
          }

          &--unknown {
            fill: rgb(var(--color-base-grey-normal));
          }
        }
      }

      #{$c}__identity-value {
        margin-block-start: -2px;
      }

      &#{$c}--has-jid {
        #{$c}__identity-badge {
          margin-inline-end: -($size-base-action-padding-sides - 3px);
        }
      }
    }

    &:hover {
      #{$c}__identity-action {
        visibility: visible;
      }
    }

    #{$c}__identity-badge,
    #{$c}__identity-action {
      flex: 0 0 auto;
    }

    #{$c}__identity-badge {
      + #{$c}__identity-value {
        margin-inline-start: 5px;
      }

      #{$c}__identity-badge-icon {
        display: block;
      }
    }

    #{$c}__identity-action {
      visibility: hidden;

      #{$c}__identity-action-icon {
        fill: rgb(var(--color-base-blue-normal));
        display: block;
        cursor: pointer;

        &:hover {
          fill: rgb(var(--color-base-blue-dark));
        }

        &:active {
          fill: darken-var(var(--color-base-blue-dark), 5%);
        }
      }
    }
  }
}
</style>
