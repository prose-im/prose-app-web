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
    "c-base-presence",
    "c-base-presence--" + size,
    "c-base-presence--" + type,
    "c-base-presence--" + show,
    {
      "c-base-presence--active": active
    }
  ]`
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BasePresence",

  props: {
    type: {
      type: String,
      required: true,

      validator(x: string) {
        return [
          "available",
          "unavailable",
          "error",
          "probe",
          "subscribe",
          "subscribed",
          "unsubscribe",
          "unsubscribed"
        ].includes(x);
      }
    },

    show: {
      type: String,
      required: true,

      validator(x: string) {
        return ["none", "away", "chat", "dnd", "xa"].includes(x);
      }
    },

    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["small", "medium", "large"].includes(x);
      }
    },

    active: {
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
$c: ".c-base-presence";

// VARIABLES
$sizes: (
  "small": 8px,
  "medium": 9px,
  "large": 12px
);

$type-shows: (
  "available": (
    "chat": $color-base-green-normal,
    "away": $color-base-orange-normal,
    "xa": $color-base-grey-normal,
    "dnd": $color-base-red-normal
  )
);

.c-base-presence {
  background-color: transparent;
  border: 1px solid $color-base-grey-normal;
  display: inline-block;
  box-sizing: border-box;
  border-radius: 100%;

  // --> SIZES <--

  @each $name, $size in $sizes {
    &--#{$name} {
      width: $size;
      height: $size;
    }
  }

  // --> TYPES + SHOWS <--

  @each $type, $shows in $type-shows {
    &--#{$type} {
      background-color: $color-base-grey-dark;
      border: 0 none;

      @each $show, $color in $shows {
        &#{$c}--#{$show} {
          background-color: $color;
        }
      }

      &#{$c}--active {
        background-color: $color-white;
      }
    }
  }

  // --> BOOLEANS <--

  &--active {
    border-color: $color-white;
  }
}
</style>
