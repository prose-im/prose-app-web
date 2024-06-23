<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-tooltip(
  @mouseenter="onMouseEnter"
  @mouseleave="onMouseLeave"
  ref="root"
)
  base-tooltip-overlay(
    v-if="isVisible && !bypassed"
    :value="tooltip"
    :align="align"
    :direction="direction"
    :anchor="overlayAnchor"
    :origin="overlayOrigin"
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
      required: true
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

      isVisible: false,

      overlayAnchor: [0, 0],
      overlayOrigin: [0, 0]
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
        // Update anchor position of root element
        const rootElement = this.$refs.root as HTMLElement,
          rootBounds = rootElement.getBoundingClientRect();

        this.overlayAnchor = [rootBounds.left, rootBounds.top];
        this.overlayOrigin = [rootBounds.width, rootBounds.height];

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

#{$c} {
  display: inline-block;
  position: relative;

  #{$c}__wrapped {
    display: contents;
  }
}
</style>
