<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-modal(
  @close="$emit('close')"
  @confirm="onConfirm"
  :confirm-label="confirmLabel"
  :confirm-loading="loading"
  class="m-leave-multi"
  destructive
)
  p.u-regular
    | You will leave this {{ type }}. You will not be able to access and send messages in this {{ type }}. You will not be notified anymore for new messages.

  p.u-medium
    | Are you sure you want to leave this {{ type }}?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { SidebarItem } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// TYPES
export type LeaveRoomHandler = (item: SidebarItem) => Promise<void>;

export default {
  name: "LeaveMulti",

  props: {
    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "proceed"],

  computed: {
    confirmLabel(): string {
      return this.type === "channel"
        ? "Leave This Channel"
        : "Leave This Group";
    }
  },

  methods: {
    // --> HELPERS <--

    async leaveRoom(item: SidebarItem): Promise<void> {
      // Remove item from sidebar (effectively leave the room)
      await item.removeFromSidebar();

      // Flush store for room
      Store.$inbox.flush(item.room.id);

      // Navigate away from room
      this.$router.push({
        name: "app.index"
      });
    },

    // --> EVENT LISTENERS <--

    onConfirm(): void {
      this.$emit("proceed", this.leaveRoom);
    }
  }
};
</script>
