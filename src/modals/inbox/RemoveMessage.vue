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
  @confirm="$emit('remove', context)"
  confirm-label="Remove"
  class="m-remove-message"
  destructive
)
  | Are you sure you want to remove this message?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "RemoveMessage",

  props: {
    context: {
      type: Object,
      required: true
    }
  },

  emits: ["close", "remove"]
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-remove-message";

.m-remove-message {
  /* TODO: show message preview */
}
</style>
