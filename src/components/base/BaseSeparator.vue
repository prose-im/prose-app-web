<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
span(
  :class=`[
    "c-base-separator",
    "c-base-separator--" + direction
  ]`
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseSeparator",

  props: {
    direction: {
      type: String,
      default: "vertical",

      validator(x: string): boolean {
        return ["horizontal", "vertical"].includes(x);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-separator";

// VARIABLES
$separator-thickness: 1px;
$separator-margin-around: 14px;

#{$c} {
  background-color: rgb(var(--color-border-secondary));

  // --> DIRECTIONS <--

  &--vertical {
    width: $separator-thickness;
    height: 20px;
    margin-inline: $separator-margin-around;
    display: inline-block;
  }

  &--horizontal {
    height: $separator-thickness;
    width: 100%;
    margin-block: $separator-margin-around;
    display: block;
  }
}
</style>
