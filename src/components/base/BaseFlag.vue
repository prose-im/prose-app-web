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
  :style=`{
    backgroundImage: backgroundImage,
    height: height,
    width: width,
    borderRadius: borderRadius
  }`
  :class=`[
    "c-base-flag",
    "c-base-flag--shadow-" + shadow
  ]`
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const SIZE_TO_BORDER_RADIUS_RATIO = 0.1;

export default {
  name: "BaseFlag",

  props: {
    code: {
      type: String,
      required: true
    },

    width: {
      type: String,
      default: "20px"
    },

    height: {
      type: String,
      default: "15px"
    },

    shadow: {
      type: String,
      default: "normal",

      validator(x: string) {
        return ["none", "light", "normal"].includes(x);
      }
    }
  },

  computed: {
    flagImageUrl() {
      return [
        "/src/assets/images/components/base/BaseFlag",
        `${this.code.toLowerCase()}.svg`
      ].join("/");
    },

    backgroundImage() {
      return `url("${this.flagImageUrl}")`;
    },

    borderRadius() {
      // Acquire numeric size
      const sizeNumeric = parseInt(this.height.replace("px", ""));

      // Compute numeric border radius
      const borderRadiusNumeric = Math.ceil(
        sizeNumeric * SIZE_TO_BORDER_RADIUS_RATIO
      );

      // Return pixel-sized border radius
      return `${borderRadiusNumeric}px`;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-flag";

.c-base-flag {
  background-color: rgb(var(--color-base-grey-light));
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  display: inline-block;

  // --> SHADOWS <--

  &--shadow-normal {
    box-shadow: 0 2px 4px 0 rgba(var(--color-black), 0.08);
  }

  &--shadow-light {
    box-shadow: 0 0 2px 0 rgba(var(--color-black), 0.08);
  }
}
</style>
