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
  :confirm-loading="loading"
  confirm-label="Close User Chat"
  class="m-close-user"
  destructive
)
  p.u-medium
    | Are you sure you want to close the chat with user?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "CloseUser",

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "proceed"]
};
</script>
