<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-layout-actions
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "LayoutActions"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-layout-actions";

.c-layout-actions {
  display: flex;

  > * {
    margin-inline: 3px;
    flex: 0 0 auto;

    &:first-child {
      margin-inline-start: 0;
    }

    &:last-child {
      margin-inline-end: 0;
    }
  }
}
</style>
