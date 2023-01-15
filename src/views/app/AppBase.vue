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
  .v-app-base__sidebar

  .v-app-base__content
    router-view
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "AppBase"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-base";

.v-app-base {
  height: 100%;
  width: 100%;
  display: flex;

  #{$c}__sidebar {
    background-color: $color-base-purple-ultra-light;
    border-right: 1px solid $color-border-secondary;
    width: 360px;
    flex: 0 0 auto;
  }

  #{$c}__content {
    flex: 1;
  }
}
</style>
