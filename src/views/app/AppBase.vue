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
  overflow: hidden;

  #{$c}__sidebar {
    border-inline-end: 1px solid rgb(var(--color-border-secondary));
    width: $size-sidebar-width;
    flex: 0 0 auto;
  }

  #{$c}__content {
    flex: 1;
  }
}
</style>
