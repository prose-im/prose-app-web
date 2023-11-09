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
    "c-base-overlay",
    {
      "c-base-overlay--transparent": transparent
    }
  ]`
)
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseOverlay",

  props: {
    transparent: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-overlay";

.c-base-overlay {
  background-color: rgba(var(--color-white), 0.65);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;

  // --> BOOLEANS <--

  &--transparent {
    background-color: transparent;
    backdrop-filter: none;
  }
}
</style>
