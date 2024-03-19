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
    v-if="isInserted && !bypassed"
  )
    span.c-base-tooltip__value
      template(
        v-if="tooltip"
      )
        | {{ tooltip }}

      slot(
        v-else
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
    tooltip: {
      type: String,
      default: null
    },

    align: {
      type: String,
      default: "center",

      validator(x: string): boolean {
        return ["left", "center", "right"].includes(x);
      }
    },

    direction: {
      type: String,
      default: "top",

      validator(x: string): boolean {
        return ["top", "bottom"].includes(x);
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

      mouseOverApplyTimeout: null as null | ReturnType<typeof setTimeout>,

      isInserted: false,
      isVisible: false
    };
  },

  methods: {
    // --> HELPERS <--

    setVisible(visible: boolean): void {
      // Update visibility
      this.isVisible = visible;

      // Mark as inserted? (insert overlay on first mark-as-visible)
      if (visible === true && this.isInserted !== true) {
        this.isInserted = true;
      }
    },

    // --> EVENT LISTENERS <--

    onClick(): void {
      if (!this.bypassed) {
        // Toggle visibility
        this.setVisible(!this.isVisible);
      }
    },

    onMouseOver(): void {
      if (!this.bypassed) {
        if (this.mouseOverApplyTimeout === null) {
          this.mouseOverApplyTimeout = setTimeout(() => {
            this.mouseOverApplyTimeout = null;

            // Mark as visible
            this.setVisible(true);
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

        // Mark as invisible
        this.setVisible(false);
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
$tooltip-spacing-block: 6px;
$tooltip-spacing-inline: -3px;

#{$c} {
  display: inline-block;
  position: relative;

  #{$c}__overlay {
    font-weight: initial;
    line-height: 18px;
    user-select: none;
    cursor: default;
    width: max-content;
    opacity: 0;
    display: block;
    visibility: hidden;
    position: absolute;
    z-index: $index-foreground-tertiary;
  }

  #{$c}__value {
    background-color: rgba(var(--color-white), 0.9);
    backdrop-filter: blur(3px);
    font-size: 11.5px;
    user-select: none;
    text-align: center;
    letter-spacing: 0.1px;
    padding: 5px 10px;
    display: inline-block;
    border-radius: 3px;
    box-shadow: 0 2px 6px 0 rgba(var(--color-shadow-primary), 0.06);

    &,
    a {
      color: rgb(var(--color-text-primary));
    }

    a {
      text-decoration: underline;
    }
  }

  #{$c}__wrapped {
    display: contents;
  }

  // --> DIRECTIONS <--

  &--top {
    > #{$c}__overlay {
      padding-block-end: $tooltip-spacing-block;
      inset-block-end: 100%;
    }
  }

  &--bottom {
    > #{$c}__overlay {
      padding-block-start: $tooltip-spacing-block;
      inset-block-start: 100%;
    }
  }

  // --> ALIGNS <--

  &--left {
    > #{$c}__overlay {
      inset-inline-start: $tooltip-spacing-inline;
      text-align: left;
    }
  }

  &--center {
    > #{$c}__overlay {
      text-align: center;
      inset-inline-start: 50%;
      transform: translateX(-50%);
    }
  }

  &--right {
    > #{$c}__overlay {
      inset-inline-end: $tooltip-spacing-inline;
      text-align: right;
    }
  }

  // --> BOOLEANS <--

  &--visible {
    > #{$c}__overlay {
      visibility: visible;
      opacity: 1;
    }
  }
}
</style>
