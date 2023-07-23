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
      base-action(
        @click="onActionHistoryPreviousClick"
        :disabled="!hasActionHistoryPrevious"
        class="a-inbox-topbar__action"
        icon="chevron.left"
        context="grey"
        size="14px"
      )

      base-action(
        @click="onActionHistoryNextClick"
        :disabled="!hasActionHistoryNext"
        class="a-inbox-topbar__action"
        icon="chevron.right"
        context="grey"
        size="14px"
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
    span.a-inbox-topbar__identity.a-inbox-topbar__identity--name
      base-presence(
        :jid="jid"
        class="a-inbox-topbar__identity-badge"
        size="medium"
      )

      span.u-bold
        | {{ rosterName }}

  template(
    v-slot:right
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

      span.u-regular
        | {{ jid }}

    base-separator(
      class="a-inbox-topbar__separator"
    )

    layout-actions
      base-action(
        class="a-inbox-topbar__action"
        icon="video"
        context="grey"
        size="20px"
        disabled
      )

      base-action(
        @click="onActionUserinfoClick"
        :active="layout.inbox.userinfo.visible"
        class="a-inbox-topbar__action"
        icon="info.circle"
        context="grey"
        size="18px"
      )

    base-separator(
      class="a-inbox-topbar__separator"
    )

    layout-actions
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
import { JID } from "@prose-im/prose-core-client-wasm";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";

// INTERFACES
interface IdentityBadge {
  status: string;
  icon: string;
}

export default {
  name: "InboxTopbar",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
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

    rosterName(): ReturnType<typeof Store.$roster.getEntryName> {
      return Store.$roster.getEntryName(this.jid);
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
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
      const historyRawJIDs: Set<string> = new Set([]),
        currentRoute = this.history.current;

      for (const adjacency in this.history.adjacent) {
        const adjacentRoutes = this.history.adjacent[adjacency];

        for (let i in adjacentRoutes) {
          const adjacentRoute = adjacentRoutes[i];

          if (
            adjacentRoute.name.startsWith("app.inbox") &&
            adjacentRoute.params.jid
          ) {
            // Make sure not to push current route JID
            if (
              !currentRoute.name.startsWith("app.inbox") ||
              currentRoute.params.jid !== adjacentRoute.params.jid
            ) {
              historyRawJIDs.add(adjacentRoute.params.jid);
            }
          }
        }
      }

      // Build popover items
      const items: Array<PopoverItem> = Array.from(historyRawJIDs)
        .map(historyRawJID => jid(historyRawJID))
        .map(historyJID => {
          return {
            type: PopoverItemType.Button,
            icon: "clock",
            label: Store.$roster.getEntryName(historyJID),

            click: () => {
              this.onActionHistoryPopoverEntryClick(historyJID);
            }
          };
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

    onActionHistoryPopoverEntryClick(jid: JID): void {
      // Go to conversation
      this.$router.push({
        name: "app.inbox",

        params: {
          jid: jid.toString()
        }
      });

      // Close popover
      this.isActionHistoryPopoverVisible = false;
    },

    onActionUserinfoClick(): void {
      Store.$layout.toggleInboxUserinfoVisible();
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
      color: $color-text-primary;
      font-size: 16px;

      #{$c}__identity-badge {
        margin-block-start: 1px;
      }
    }

    &--jid {
      color: $color-text-secondary;
      font-size: 15px;

      #{$c}__identity-badge {
        margin-block-start: 2px;

        &--verified {
          fill: $color-base-green-normal;
        }

        &--unknown {
          fill: $color-base-grey-normal;
        }
      }
    }

    #{$c}__identity-badge {
      margin-inline-end: 5px;
      flex: 0 0 auto;
    }
  }
}
</style>
