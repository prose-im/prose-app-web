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
  confirm-label="Remove Contact"
  class="m-remove-contact"
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

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "proceed"]
};
</script>
