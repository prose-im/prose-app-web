<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-view(
  :topbar-component="topbarComponent"
  class="v-app-spotlight-replies"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";

// PROJECT: ASSEMBLIES
import SpotlightTopbar from "@/assemblies/spotlight/SpotlightTopbar.vue";

// PROJECT: COMPOSABLES
import { useInterfaceTitle } from "@/composables/interface";

export default {
  name: "AppSpotlightReplies",

  setup() {
    useInterfaceTitle("Replies");
  },

  data() {
    return {
      // --> DATA <--

      topbarComponent: shallowRef(SpotlightTopbar)
    };
  }
};
</script>
