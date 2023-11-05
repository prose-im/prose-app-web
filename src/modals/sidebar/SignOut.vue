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
  confirm-label="Sign Out"
  class="m-sign-out"
  size="large"
  destructive
)
  base-placeholder-image(
    illustration="goodbye"
    title="Do you really want to sign out?"
    description="You will need to login again to access your inbox and receive notifications."
    class="m-sign-out__placeholder"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SignOut",

  emits: ["close", "proceed"]
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-sign-out";

.m-sign-out {
  #{$c}__placeholder {
    margin-inline: auto;
    margin-block: 16px 36px;
  }
}
</style>
