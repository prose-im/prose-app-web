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
  confirm-label="Remove Contact"
  destructive
)
  p.u-regular
    | This user will be removed from your contacts. Note that you can only remove non-team members from your contacts.

  p.u-medium
    | Are you sure you want to remove this contact?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "RemoveContact",

  emits: ["close", "proceed"]
};
</script>
