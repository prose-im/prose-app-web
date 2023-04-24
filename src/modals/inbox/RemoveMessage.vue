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
  confirm-label="Remove Message"
  class="m-remove-message"
  destructive
)
  p.u-regular
    | The message will disappear from your inbox. We will also try to remove it on your recipient end, although removal is not guaranteed.

  p.u-medium
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
