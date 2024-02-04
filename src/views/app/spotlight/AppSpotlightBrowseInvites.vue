<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-browse(
  :class=`[
    "v-app-spotlight-browse-invites",
    {
      "v-app-spotlight-browse-invites--empty": (groups.length === 0)
    }
  ]`
  :groups="groups"
  :loading="loading"
  empty-illustration="invitations-empty"
  empty-title="No pending invites."
  empty-description="People can invite you to channels and groups. Contact requests from other workspaces will also appear here."
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import { Groups as ListBrowseGroups } from "@/components/list/ListBrowse.vue";

export default {
  name: "AppSpotlightBrowseInvites",

  data() {
    return {
      // --> STATE <--

      loading: false
    };
  },

  computed: {
    groups(): ListBrowseGroups {
      // TODO
      return [];
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-spotlight-browse-invites";

.v-app-spotlight-browse-invites {
  padding-block: $size-spotlight-browse-padding-block-start
    $size-spotlight-browse-padding-block-end;

  // --> BOOLEANS <--

  &--empty {
    height: 100%;
    padding-block: 0;
  }
}
</style>
