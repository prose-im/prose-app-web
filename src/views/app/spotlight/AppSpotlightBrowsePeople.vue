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
    "v-app-spotlight-browse-people",
    {
      "v-app-spotlight-browse-people--empty": (groups.length === 0)
    }
  ]`
  :groups="groups"
  :loading="loading"
  empty-illustration="contact-not-found"
  empty-title="No people in your team."
  empty-description="There is no one in your workspace at the moment. This is your team's public directory."
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import { Groups as ListBrowseGroups } from "@/components/list/ListBrowse.vue";

export default {
  name: "AppSpotlightBrowsePeople",

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
$c: ".v-app-spotlight-browse-people";

.v-app-spotlight-browse-people {
  padding-block: $size-spotlight-browse-padding-block-start
    $size-spotlight-browse-padding-block-end;

  // --> BOOLEANS <--

  &--empty {
    height: 100%;
    padding-block: 0;
  }
}
</style>
