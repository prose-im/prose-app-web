<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.v-app-base
  app-sidebar(
    v-resizable.r="{ minWidth: 220, maxWidth: 300, handleWidth: 8, handleZIndex: 1 }"
    class="v-app-base__sidebar"
  )

  .v-app-base__content
    router-view
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: ASSEMBLIES
import AppSidebar from "@/assemblies/app/AppSidebar.vue";

export default {
  name: "AppBase",

  components: { AppSidebar }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-base";

#{$c} {
  height: 100%;
  width: 100%;
  display: flex;
  overflow: clip;

  #{$c}__sidebar {
    border-inline-end: 1px solid rgb(var(--color-border-secondary));
    width: $size-sidebar-default-width;
    flex: 0 0 auto;

    // Hack: prevent v-resizable directive from applying its absolute position
    position: relative !important;
  }

  #{$c}__content {
    background-color: rgb(var(--color-background-primary));
    flex: 1;
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: $size-screen-reduced-width-breakpoint) {
  #{$c} {
    #{$c}__sidebar {
      width: $size-sidebar-reduced-width;
    }
  }
}
</style>
