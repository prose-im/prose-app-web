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
  class="v-app-spotlight-browse"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";

// PROJECT: ASSEMBLIES
import SpotlightBrowseTopbar from "@/assemblies/spotlight/SpotlightBrowseTopbar.vue";

export default {
  name: "AppSpotlightBrowse",

  data() {
    return {
      // --> DATA <--

      topbarComponent: shallowRef(SpotlightBrowseTopbar)
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-spotlight-browse";

.v-app-spotlight-browse {
  /* TODO */
}
</style>
