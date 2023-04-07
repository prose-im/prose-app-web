<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "c-base-count",
    "u-medium",
    "c-base-count--" + color
  ]`
)
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
    },

    color: {
      type: String,
      default: "blue",

      validator(x: string) {
        return ["blue", "white"].includes(x);
      }
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
  font-size: 12px;
  text-align: center;
  line-height: $count-size-base;
  padding-inline: $count-padding-sides;
  min-width: ($count-size-base - (2 * $count-padding-sides));
  border-radius: 4px;

  // --> COLORS <--

  &--blue {
    background-color: $color-base-blue-normal;
    color: $color-white;
  }

  &--white {
    background-color: $color-white;
    color: $color-black;
  }
}
</style>
