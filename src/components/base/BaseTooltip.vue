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
  @mouseover="onMouseOver"
  @mouseleave="onMouseLeave"
  :class=`[
    "c-base-tooltip",
    "c-base-tooltip--" + direction,
    "c-base-tooltip--" + align,
    {
      "c-base-tooltip--visible": isVisible
    }
  ]`
)
  .c-base-tooltip__overlay(
    v-if="!bypassed"
  )
    span.c-base-tooltip__value
      slot(
        name="tooltip"
      )

  .c-base-tooltip__wrapped(
    @click="onClick"
  )
    slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const MOUSE_OVER_APPLY_DELAY = 150; // 150 milliseconds

export default {
  name: "BaseTooltip",

  props: {
    align: {
      type: String,
      default: "center",

      validator(x: string): boolean {
        return ["left", "center"].includes(x);
      }
    },

    direction: {
      type: String,
      default: "top",

      validator(x: string): boolean {
        return ["top"].includes(x);
      }
    },

    bypassed: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      // --> STATE <--

      mouseOverApplyTimeout: null,

      // --> DATA <--

      isVisible: false
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onClick(): void {
      if (!this.bypassed) {
        // Toggle visibility
        this.isVisible = !this.isVisible;
      }
    },

    onMouseOver(): void {
      if (!this.bypassed) {
        if (this.mouseOverApplyTimeout === null) {
          this.mouseOverApplyTimeout = setTimeout(() => {
            this.mouseOverApplyTimeout = null;

            this.isVisible = true;
          }, MOUSE_OVER_APPLY_DELAY);
        }
      }
    },

    onMouseLeave(): void {
      if (!this.bypassed) {
        // Any over timeout set? Cancel it first?
        if (this.mouseOverApplyTimeout !== null) {
          clearTimeout(this.mouseOverApplyTimeout);

          this.mouseOverApplyTimeout = null;
        }

        this.isVisible = false;
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-tooltip";

// VARIABLES
$tooltip-area-width: 1000px;
$tooltip-spacing-block: 6px;
$tooltip-spacing-inline: -3px;

.c-base-tooltip {
  display: inline-block;
  position: relative;

  #{$c}__overlay {
    font-weight: initial;
    line-height: 18px;
    user-select: none;
    cursor: default;
    width: $tooltip-area-width;
    opacity: 0;
    display: block;
    visibility: hidden;
    position: absolute;
    z-index: 100;
  }

  #{$c}__value {
    background-color: rgba($color-white, 0.9);
    backdrop-filter: blur(3px);
    font-size: 11.5px;
    user-select: none;
    text-align: center;
    letter-spacing: 0.1px;
    padding: 5px 10px;
    display: inline-block;
    border-radius: 3px;
    box-shadow: 0 2px 6px 0 rgba($color-black, 0.06);

    &,
    a {
      color: $color-text-primary;
    }

    a {
      text-decoration: underline;
    }
  }

  #{$c}__wrapped {
    display: inline-block;
  }

  // --> DIRECTIONS <--

  &--top {
    #{$c}__overlay {
      padding-block-end: $tooltip-spacing-block;
      inset-block-end: 100%;
    }
  }

  // --> ALIGNS <--

  &--left {
    #{$c}__overlay {
      inset-inline-start: $tooltip-spacing-inline;
      text-align: left;
    }
  }

  &--center {
    #{$c}__overlay {
      inset-inline-start: 50%;
      margin-inline-start: (-1 * calc($tooltip-area-width / 2));
      text-align: center;
    }
  }

  // --> BOOLEANS <--

  &--visible {
    #{$c}__overlay {
      visibility: visible;
      opacity: 1;
    }
  }
}
</style>
