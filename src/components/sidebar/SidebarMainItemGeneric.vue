<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-button(
  @click="onButtonClick"
  :translucent="translucent"
  :active="active"
  :ellipsis="ellipsis"
  :important="item.hasDraft || item.unreadCount > 0 || item.mentionsCount > 0"
  :class=`[
    "c-sidebar-main-item-generic",
    {
      "c-sidebar-main-item-generic--active": active
    }
  ]`
)
  template(
    v-if="$slots.icon"
    v-slot:icon
  )
    slot(
      name="icon"
    )

  template(
    v-slot:default
  )
    slot

  template(
    v-if="isRoomStillInitializing || roomError || item.hasDraft || item.unreadCount > 0 || item.mentionsCount > 0"
    v-slot:details
  )
    base-tooltip(
      v-if="item.hasDraft"
      align="right"
      tooltip="Draft Pending"
    )
      base-icon(
        name="pencil"
        size="12px"
        class="c-sidebar-main-item-generic__draft"
      )

    base-count(
      v-if="item.mentionsCount > 0"
      :color="countColor"
      icon="at"
    )

    base-count(
      v-else-if="item.unreadCount > 0"
      :count="item.unreadCount"
      :color="countColor"
    )

    base-tooltip(
      v-if="isRoomStillInitializing"
      align="right"
      tooltip="Still Connecting…"
    )
      base-spinner(
        :color="active ? 'rgb(var(--color-white))' : 'rgb(var(--color-base-grey-normal))'"
        size="7px"
        border-width="1px"
        speed="1500ms"
      )

    base-tooltip(
      v-else-if="roomError"
      :tooltip="roomError"
      align="right"
    )
      base-icon(
        name="exclamationmark.triangle.fill"
        size="15px"
        class="c-sidebar-main-item-generic__error"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import {
  SidebarItem,
  RoomStateType,
  RoomStateDisconnected
} from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// CONSTANTS
const TOGGLE_ROOM_CONNECTING_DELAY = 3000; // 3 seconds

export default {
  name: "SidebarMainItemGeneric",

  props: {
    item: {
      type: Object as PropType<SidebarItem>,
      required: true
    },

    translucent: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: false
    },

    ellipsis: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      // --> STATE <--

      isRoomStillInitializing: false,

      toggleRoomConnectingTimeout: null as null | ReturnType<typeof setTimeout>
    };
  },

  computed: {
    countColor(): string {
      return this.active === true ? "white" : "blue";
    },

    roomError(): string | null {
      // Return error? (if disconnected)
      if (this.item.room.state.type === RoomStateType.Disconnected) {
        return (this.item.room.state as RoomStateDisconnected).error || null;
      }

      return null;
    },

    isRoomConnecting(): boolean {
      return this.item.room.state.type === RoomStateType.Connecting;
    }
  },

  watch: {
    isRoomConnecting(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.toggleRoomConnecting(newValue);
      }
    }
  },

  mounted() {
    // Initialize first room connecting state
    this.toggleRoomConnecting(this.isRoomConnecting);
  },

  beforeUnmount() {
    // Un-initialize room connecting state (forcibly, so as to stop any \
    //   scheduled timer)
    this.toggleRoomConnecting(false);
  },

  methods: {
    // --> HELPERS <--

    toggleRoomConnecting(connecting: boolean): void {
      // Clear any previous toggle
      if (this.toggleRoomConnectingTimeout !== null) {
        clearTimeout(this.toggleRoomConnectingTimeout);
      }

      if (connecting === true) {
        // Delay state update, since it is normal that rooms start in a \
        //   connecting state, only slow rooms should show the connecting \
        //   indicator.
        this.toggleRoomConnectingTimeout = setTimeout(() => {
          this.isRoomStillInitializing = true;
        }, TOGGLE_ROOM_CONNECTING_DELAY);
      } else {
        this.isRoomStillInitializing = false;
      }
    },

    // --> EVENT LISTENERS <--

    onButtonClick(): void {
      this.$router.push({
        name: "app.inbox",
        params: { roomId: this.item.room.id }
      });
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-main-item-generic";

#{$c} {
  #{$c}__draft {
    fill: rgb(var(--color-base-grey-dark));
  }

  #{$c}__error {
    fill: rgb(var(--color-base-orange-dark));
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__draft,
    #{$c}__error {
      fill: rgb(var(--color-white));
    }
  }
}
</style>
