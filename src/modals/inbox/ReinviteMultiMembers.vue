<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-modal(
  @close="$emit('close')"
  @confirm="$emit('proceed')"
  confirm-label="Re-Invite Members"
  :confirm-loading="loading"
  class="m-reinvite-multi-members"
)
  p.u-regular
    | You will send a new invitation to all members of the {{ type }}, to make sure that everyone has joined the {{ type }}.

  p.u-medium
    | Are you sure you want to re-invite everyone?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "ReinviteMultiMembers",

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

  emits: ["close", "proceed"]
};
</script>
