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
  @mouseenter="onMouseEnter"
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
    @click="onWrappedClick"
  )
    slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const AUTO_HIDE_DELAY = 20000; // 20 seconds
const MOUSE_ENTER_APPLY_DELAY = 250; // 250 milliseconds

const CLICK_DIRECTIONS = {
  hide: "hide",
  show: "show",
  both: "both"
};

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

    click: {
      type: String,
      default: null,

      validator(x: string): boolean {
        return [
          CLICK_DIRECTIONS.hide,
          CLICK_DIRECTIONS.show,
          CLICK_DIRECTIONS.both
        ].includes(x);
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

      autoHideTimeout: null as null | ReturnType<typeof setTimeout>,
      mouseEnterApplyTimeout: null as null | ReturnType<typeof setTimeout>,

      isInserted: false,
      isVisible: false
    };
  },

  methods: {
    // --> HELPERS <--

    setVisible(visible: boolean): void {
      // Clear auto-hide? (if any)
      if (this.autoHideTimeout !== null) {
        clearTimeout(this.autoHideTimeout);

        this.autoHideTimeout = null;
      }

      // Update visibility
      this.isVisible = visible;

      // Now visible? Proceed more actions
      if (visible === true) {
        // Mark as inserted? (insert overlay on first mark-as-visible)
        if (this.isInserted !== true) {
          this.isInserted = true;
        }

        // Schedule auto-hide?
        // Notice: this is done to auto-clear any dangling tooltip that did \
        //   not hide on eg. mouse leave, due to eg. moving the mouse too fast \
        //   from the tooltip to eg. a fixed-positioned element. This is \
        //   unfortunately a limitation from certain browsers, which can only \
        //   be fixed by applying a safety hide timeout.
        this.autoHideTimeout = setTimeout(() => {
          this.autoHideTimeout = null;

          this.setVisible(false);
        }, AUTO_HIDE_DELAY);
      }
    },

    // --> EVENT LISTENERS <--

    onWrappedClick(): void {
      // Do not show/hide tooltip on click on wrapped content if this content \
      //   is not marked as clickable (otherwise this handler may result in \
      //   conflicting behavior).
      if (this.click !== null) {
        if (this.isVisible !== true) {
          // Mark as visible? (only if not bypassed, and click must result in \
          //   a show or both directions)
          if (
            this.bypassed !== true &&
            (this.click === CLICK_DIRECTIONS.show ||
              this.click === CLICK_DIRECTIONS.both)
          ) {
            this.setVisible(true);
          }
        } else {
          // Mark as invisible (only if click must result in a hide or both \
          //   directions)
          if (
            this.click === CLICK_DIRECTIONS.hide ||
            this.click === CLICK_DIRECTIONS.both
          ) {
            this.setVisible(false);
          }
        }
      }
    },

    onMouseEnter(): void {
      // Mark as visible after some time? (only if not bypassed and not \
      //   already visible)
      if (this.bypassed !== true && this.isVisible !== true) {
        if (this.mouseEnterApplyTimeout === null) {
          this.mouseEnterApplyTimeout = setTimeout(() => {
            this.mouseEnterApplyTimeout = null;

            // Mark as visible
            this.setVisible(true);
          }, MOUSE_ENTER_APPLY_DELAY);
        }
      }
    },

    onMouseLeave(): void {
      // Any mouse enter timeout set? (cancel it first)
      if (this.mouseEnterApplyTimeout !== null) {
        clearTimeout(this.mouseEnterApplyTimeout);

        this.mouseEnterApplyTimeout = null;
      }

      // Mark as invisible right away? (only if visible)
      if (this.isVisible === true) {
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
