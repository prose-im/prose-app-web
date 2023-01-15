<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-app
  base-alert

  router-view
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "App"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-app";

.c-app {
  background-color: $color-background-primary;
  user-select: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  position: absolute;
  inset: 0;
}
</style>
