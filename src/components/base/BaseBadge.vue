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
    "c-base-badge",
    "c-base-badge--" + color
  ]`
  :style=`{
    height: size,
    width: size,
    borderRadius: size
  }`
)
  base-icon(
    :name="icon"
    :size="iconSize"
    class="c-base-badge__icon"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const SIZE_TO_ICON_SIZE_RATIO = 0.58;

export default {
  name: "BaseBadge",

  props: {
    icon: {
      type: String,
      required: true
    },

    size: {
      type: String,
      default: "32px"
    },

    color: {
      type: String,
      default: "grey",

      validator(x: string) {
        return ["grey", "green", "blue", "orange", "red"].includes(x);
      }
    }
  },

  computed: {
    iconSize(): string {
      // Acquire numeric size
      const sizeNumeric = parseInt(this.size.replace("px", ""), 10);

      // Compute numeric icon size
      const iconSizeNumeric = Math.ceil(sizeNumeric * SIZE_TO_ICON_SIZE_RATIO);

      // Return pixel-sized icon size
      return `${iconSizeNumeric}px`;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-badge";

.c-base-badge {
  background-color: $color-black;
  display: flex;
  align-items: center;
  justify-content: center;

  #{$c}__icon {
    fill: $color-white;
  }

  // --> COLORS <--

  &--grey {
    background-color: $color-base-grey-normal;
  }

  &--green {
    background-color: $color-base-green-normal;
  }

  &--blue {
    background-color: $color-base-blue-dark;
  }

  &--orange {
    background-color: $color-base-orange-normal;
  }

  &--red {
    background-color: $color-base-red-normal;
  }
}
</style>
