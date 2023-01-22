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
    .v-app-base__sidebar-main

    .v-app-base__sidebar-context

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
    border-inline-end: 1px solid $color-border-secondary;
    width: 300px;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;

    #{$c}__sidebar-main {
      flex: 1;
    }

    #{$c}__sidebar-context {
      border-block-start: 1px solid $color-border-secondary;
      height: $size-inbox-form-height;
      flex: 0 0 auto;
    }
  }

  #{$c}__content {
    flex: 1;
  }
}
</style>
