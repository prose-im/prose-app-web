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
    "c-base-stream-view",
    "c-base-stream-view--" + size,
    {
      "c-base-stream-view--disabled": disabled
    }
  ]`
)
  .c-base-stream-view__view
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseStreamView",

  props: {
    streamUrl: {
      type: String,
      required: true
    },

    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["small", "medium", "custom"].includes(x);
      }
    },

    disabled: {
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
$c: ".c-base-stream-view";

.c-base-stream-view {
  border: 1px solid $color-border-primary;
  aspect-ratio: 4/3;
  border-radius: 3px;
  position: relative;
  box-sizing: border-box;

  #{$c}__view {
    background-color: $color-base-grey-light;
    position: absolute;
    inset: 2px;
    border-radius: 2px;
  }

  // --> SIZES <--

  &--small {
    width: 160px;
  }

  &--medium {
    width: 240px;
  }

  &--custom {
    aspect-ratio: auto;
  }

  // --> BOOLEANS <--

  &--disabled {
    cursor: not-allowed;

    #{$c}__view {
      opacity: 0.6;
    }
  }
}
</style>
