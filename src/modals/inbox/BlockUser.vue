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
  confirm-label="Block This User"
  class="m-block-user"
  confirm-disabled
  destructive
)
  p.u-regular
    | This user will be blocked. You will not be able to reach or be reached by this user anymore.

  p.u-medium
    | Are you sure you want to block this user?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BlockUser",

  emits: ["close", "proceed"]
};
</script>
