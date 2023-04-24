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
  @confirm="$emit('proceed', context)"
  confirm-label="Sign Out"
  destructive
)
  p.u-regular
    | You will be signed out of your account and will need to login back again to access your inbox. You will not receive new message notifications anymore.

  p.u-medium
    | Do you really want to sign out?
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
