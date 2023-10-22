<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-form-loader
  .c-inbox-form-loader__pulse.u-animate.u-animate--infinite.u-animate--midslow.u-animate--fade-in-out-expand-horizontal(
    v-for="pulse in pulses"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxFormLoader",

  data() {
    return {
      // --> DATA <--

      pulses: 3
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-form-loader";

.c-inbox-form-loader {
  background-color: rgba(var(--color-base-green-normal), 0.2);
  height: 3px;
  position: relative;

  #{$c}__pulse {
    background-color: rgb(var(--color-base-green-normal));
    position: absolute;
    inset-block: 0;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    animation-timing-function: ease-in-out;

    &:nth-child(1) {
      min-width: 30px;
      z-index: 1;
      opacity: 0.1;
    }

    &:nth-child(2) {
      animation-delay: 0.5s;
      min-width: 20px;
      z-index: 2;
      opacity: 0.5;
    }

    &:nth-child(3) {
      animation-delay: 0.7s;
      min-width: 10px;
      z-index: 3;
      opacity: 0.9;
    }
  }
}
</style>
