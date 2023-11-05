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
  @confirm="$emit('proceed')"
  :confirm-label="confirmLabel"
  class="m-leave-group"
  confirm-disabled
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
export default {
  name: "LeaveGroup",

  props: {
    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    }
  },

  emits: ["close", "proceed"],

  computed: {
    confirmLabel(): string {
      return this.type === "channel"
        ? "Leave This Channel"
        : "Leave This Group";
    }
  }
};
</script>
