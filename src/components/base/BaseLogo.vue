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
    "c-base-logo",
    "c-base-logo--" + size,
    "c-base-logo--" + tint
  ]`
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseLogo",

  props: {
    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["small", "medium", "large"].includes(x);
      }
    },

    tint: {
      type: String,
      default: "normal",

      validator(x: string) {
        return ["normal", "black", "white"].includes(x);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-logo";

// VARIABLES
$size-ratio: calc(28 / 104);

$size-widths: (
  "small": 80px,
  "medium": 120px,
  "large": 140px
);

.c-base-logo {
  @include mask-image("@/assets/images/components/base/BaseLogo/logo-path.svg");
  @include mask-repeat(no-repeat);
  @include mask-size(contain);
  @include mask-position(left);

  width: 104px;
  height: 28px;
  display: block;

  // --> SIZE <--

  @each $size, $width in $size-widths {
    &--#{$size} {
      width: $width;
      height: round($width * $size-ratio);
    }
  }

  // --> TINTS <--

  &--normal {
    background-color: $color-base-blue-normal;
    background-image: url("@/assets/images/components/base/BaseLogo/logo-tint-normal.webp");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: left;
  }

  &--black {
    background-color: $color-black;
  }

  &--white {
    background-color: $color-white;
  }
}
</style>
