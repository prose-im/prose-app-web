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
  class="v-app-spotlight-conversations"
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

export default {
  name: "AppSpotlightConversations",

  data() {
    return {
      // --> DATA <--

      topbarComponent: shallowRef(SpotlightTopbar)
    };
  }
};
</script>
