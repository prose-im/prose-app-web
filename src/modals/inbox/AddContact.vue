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
  :confirm-loading="loading"
  confirm-label="Add Contact"
  class="m-add-contact"
)
  p.u-regular
    | This user will be added to your contacts. They will also receive an invitation to add you to their own contacts, which they can accept or refuse.

  p.u-medium
    | Are you sure you want to add this contact?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "AddContact",

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "proceed"]
};
</script>
