<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-count.u-medium
  | {{ count }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseCount",

  props: {
    count: {
      type: Number,
      default: 0
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-count";

// VARIABLES
$count-size-base: 20px;
$count-padding-sides: 5px;

.c-base-count {
  background-color: $color-base-blue-normal;
  color: $color-white;
  font-size: 12px;
  text-align: center;
  line-height: $count-size-base;
  padding-inline: $count-padding-sides;
  min-width: ($count-size-base - (2 * $count-padding-sides));
  border-radius: 4px;
}
</style>
