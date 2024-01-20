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
  :confirm-loading="loading"
  class="m-delete-multi"
  destructive
)
  p.u-regular
    | You will delete this {{ type }}. All messages will be permanently deleted, and all members will be kicked. Make sure you know what you are doing!

  p.u-medium
    | Are you really sure you want to destroy this {{ type }}?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "DeleteMulti",

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
        ? "Destroy This Channel"
        : "Destroy This Group";
    }
  }
};
</script>
