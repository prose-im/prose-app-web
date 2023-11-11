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
)
  template(
    v-slot:left
  )
    layout-actions
      base-tooltip(
        align="left"
        direction="bottom"
        tooltip="Go to Previous"
      )
        base-action(
          @click="onActionHistoryPreviousClick"
          :disabled="!hasActionHistoryPrevious"
          class="a-inbox-topbar__action"
          icon="chevron.left"
          context="grey"
          size="14px"
        )

      base-tooltip(
        align="left"
        direction="bottom"
        tooltip="Go to Next"
      )
        base-action(
          @click="onActionHistoryNextClick"
          :disabled="!hasActionHistoryNext"
          class="a-inbox-topbar__action"
          icon="chevron.right"
          context="grey"
          size="14px"
        )

      base-tooltip(
        :bypassed="isActionHistoryPopoverVisible"
        align="left"
        direction="bottom"
        tooltip="Show History"
      )
        base-action(
          @click="onActionHistoryDropdownClick"
          :disabled="!hasActionHistoryDropdown"
          :active="isActionHistoryPopoverVisible"
          class="a-inbox-topbar__action"
          icon="clock"
          context="grey"
          size="18px"
          dropdown
        )
          base-popover-list(
            v-if="isActionHistoryPopoverVisible"
            v-click-away="onActionHistoryPopoverClickAway"
            :items="actionHistoryPopoverItems"
            class="a-inbox-topbar__action-popover"
          )

  template(
    v-slot:middle
  )
    span.a-inbox-topbar__identity.a-inbox-topbar__identity--name(
      v-if="room"
    )
      base-presence(
        :jid="jid"
        class="a-inbox-topbar__identity-badge"
        size="medium"
      )

      span.a-inbox-topbar__identity-value.u-bold
        | {{ room.name }}

      base-icon(
        v-if="identityFavoriteIcon"
        @click="onIdentityActionFavoriteClick"
        :name="identityFavoriteIcon"
        size="14px"
        class="a-inbox-topbar__identity-action"
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
      span.a-inbox-topbar__identity.a-inbox-topbar__identity--jid
        base-icon(
          :name="identityBadge.icon"
          :class=`[
            "a-inbox-topbar__identity-badge",
            "a-inbox-topbar__identity-badge--" + identityBadge.status
          ]`
          size="16px"
        )

        span(
          v-if="truncatedJID"
          class="a-inbox-topbar__identity-value u-regular"
        )
          | {{ truncatedJID }}

    base-separator(
      class="a-inbox-topbar__separator"
    )

    layout-actions
      base-tooltip(
        align="right"
        direction="bottom"
        tooltip="Start Video Call"
      )
        base-action(
          class="a-inbox-topbar__action"
          icon="video"
          context="grey"
          size="20px"
          disabled
        )

      base-tooltip(
        :tooltip="actionDetailsTooltip"
        align="right"
        direction="bottom"
      )
        base-action(
          @click="onActionDetailsClick"
          :active="layout.inbox.details.visible"
          class="a-inbox-topbar__action"
          icon="info.circle"
          context="grey"
          size="18px"
        )

    base-separator(
      class="a-inbox-topbar__separator"
    )

    layout-actions
      base-tooltip(
        align="right"
        direction="bottom"
        tooltip="Search"
      )
        base-action(
          class="a-inbox-topbar__action"
          icon="magnifyingglass"
          context="grey"
          size="17px"
          disabled
        )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, Room, RoomID, RoomType } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";

// INTERFACES
interface IdentityBadge {
  status: string;
  icon: string;
}

// CONSTANTS
const JID_TRUNCATE_LENGTH = 15;

export default {
  name: "InboxTopbar",

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

  data() {
    return {
      // --> STATE <--

      isActionHistoryPopoverVisible: false
    };
  },

  computed: {
    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    history(): typeof Store.$history {
      return Store.$history;
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
      if (this.room?.type === RoomType.DirectMessage) {
        let jid = this.originalJID;

        if (jid.length < JID_TRUNCATE_LENGTH) {
          return jid;
        }

        return jid.slice(0, JID_TRUNCATE_LENGTH - 1) + "…";
      }

      return null;
    },

    identityBadge(): IdentityBadge {
      // Identity verified?
      if (this.profile.security && this.profile.security.verification) {
        return {
          status: "verified",
          icon: "checkmark.seal.fill"
        };
      }

      // Identity unknown
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

    hasActionHistoryPrevious(): boolean {
      return this.history.adjacent.previous.length > 0;
    },

    hasActionHistoryNext(): boolean {
      return this.history.adjacent.next.length > 0;
    },

    hasActionHistoryDropdown(): boolean {
      return this.hasActionHistoryPrevious || this.hasActionHistoryNext;
    },

    actionHistoryPopoverItems(): Array<PopoverItem> {
      // Acquire inbox JIDs
      const historyRawRoomIDs: Set<string> = new Set([]),
        currentRoute = this.history.current,
        currentRouteRoomId = currentRoute.params.roomId as string;

      [this.history.adjacent.previous, this.history.adjacent.next].forEach(
        adjacentRoutes => {
          adjacentRoutes.forEach(adjacentRoute => {
            const adjacentRouteRoomId = adjacentRoute.params.roomId as string;

            if (
              adjacentRoute.name.startsWith("app.inbox") &&
              adjacentRouteRoomId
            ) {
              // Make sure not to push current route JID
              if (
                !currentRoute.name.startsWith("app.inbox") ||
                currentRouteRoomId !== adjacentRouteRoomId
              ) {
                historyRawRoomIDs.add(adjacentRouteRoomId);
              }
            }
          });
        }
      );

      // Build popover items
      const items: Array<PopoverItem> = [];

      Array.from(historyRawRoomIDs).forEach((historyRoomID: RoomID) => {
        const historyRoom = Store.$room.getRoom(historyRoomID) || undefined;

        if (historyRoom !== undefined) {
          items.push({
            type: PopoverItemType.Button,
            icon: "clock",
            label: historyRoom.name,

            click: () => {
              this.onActionHistoryPopoverEntryClick(historyRoomID);
            }
          });
        }
      });

      if (items.length === 0) {
        // Append empty indicator?
        items.push({
          type: PopoverItemType.Button,
          label: "No history",
          color: "lighter",
          disabled: true
        });
      }

      return items;
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

    onActionHistoryPopoverClickAway(): void {
      // Close popover
      this.isActionHistoryPopoverVisible = false;
    },

    onActionHistoryPopoverEntryClick(roomId: RoomID): void {
      // Go to conversation
      this.$router.push({
        name: "app.inbox",

        params: {
          roomId: roomId
        }
      });

      // Close popover
      this.isActionHistoryPopoverVisible = false;
    },

    onActionDetailsClick(): void {
      Store.$layout.toggleInboxDetailsVisible();
    },

    onActionHistoryPreviousClick(): void {
      this.$router.go(-1);
    },

    onActionHistoryNextClick(): void {
      this.$router.go(1);
    },

    onActionHistoryDropdownClick(): void {
      // Toggle popover
      this.isActionHistoryPopoverVisible = !this.isActionHistoryPopoverVisible;
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
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-topbar";

.a-inbox-topbar {
  #{$c}__separator {
    margin-inline: 14px;
  }

  #{$c}__action {
    #{$c}__action-popover {
      position: absolute;
      inset-inline-start: 0;
      inset-block-start: calc(
        100% + #{$size-base-popover-list-inset-block-edge-offset}
      );
      z-index: 1;
    }
  }

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
        &--verified {
          fill: rgb(var(--color-base-green-normal));
        }

        &--unknown {
          fill: rgb(var(--color-base-grey-normal));
        }
      }

      #{$c}__identity-value {
        margin-block-start: -2px;
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
    }

    #{$c}__identity-action {
      fill: rgb(var(--color-base-blue-normal));
      cursor: pointer;
      visibility: hidden;

      &:hover {
        fill: rgb(var(--color-base-blue-dark));
      }

      &:active {
        fill: darken-var(var(--color-base-blue-dark), 5%);
      }
    }
  }
}
</style>
