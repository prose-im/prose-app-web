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
  router-view
</template>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-app";

.c-app {
  background-color: $color-background-primary;
  user-select: none;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>
