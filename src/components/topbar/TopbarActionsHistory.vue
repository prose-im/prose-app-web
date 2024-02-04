<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-actions(
  class="c-topbar-actions-history"
)
  base-tooltip(
    align="left"
    direction="bottom"
    tooltip="Go to Previous"
  )
    base-action(
      @click="onActionHistoryPreviousClick"
      :disabled="!hasActionHistoryPrevious"
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
      icon="clock"
      context="grey"
      size="18px"
      dropdown
    )
      base-popover-list(
        v-if="isActionHistoryPopoverVisible"
        v-click-away="onActionHistoryPopoverClickAway"
        :items="actionHistoryPopoverItems"
        class="c-topbar-actions-history__popover"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { RoomID } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";
import { HistoryRoute } from "@/store/tables/history";

// PROJECT: COMPONENTS
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";

export default {
  name: "TopbarActionsHistory",

  data() {
    return {
      // --> STATE <--

      isActionHistoryPopoverVisible: false
    };
  },

  computed: {
    history(): typeof Store.$history {
      return Store.$history;
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
          adjacentRoutes.forEach((adjacentRoute: HistoryRoute) => {
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
            label: historyRoom.name,

            icon: {
              name: "clock"
            },

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

    onActionHistoryPreviousClick(): void {
      this.$router.go(-1);
    },

    onActionHistoryNextClick(): void {
      this.$router.go(1);
    },

    onActionHistoryDropdownClick(): void {
      // Toggle popover
      this.isActionHistoryPopoverVisible = !this.isActionHistoryPopoverVisible;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-topbar-actions-history";

.c-topbar-actions-history {
  #{$c}__popover {
    position: absolute;
    inset-inline-start: 0;
    inset-block-start: calc(
      100% + #{$size-base-popover-list-inset-block-edge-offset}
    );
    z-index: 1;
  }
}
</style>
