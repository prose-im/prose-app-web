<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-list-item
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "ListItem"

  /* TODO */
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-list-item";

// VARIABLES
/* TODO */

.c-list-item {
  border-color: $color-base-grey-normal;
  border-style: solid;
  border-block-start-width: 1px;
  height: 34px;

  &:last-child {
    border-block-end-width: 1px;
  }
}
</style>
