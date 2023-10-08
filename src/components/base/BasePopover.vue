<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-popover(
  :style=`{
    transform: offsetAdapt.transform
  }`
  ref="root"
)
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const ADAPT_EDGE_OFFSET = 2;

export default {
  name: "BasePopover",

  props: {
    adapt: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      // --> STATE <--

      offsetAdapt: {
        transform: null as string | null,
        block: 0,
        inline: 0
      }
    };
  },

  mounted() {
    // Automatically adapt popover offset?
    if (this.adapt === true) {
      this.autoAdaptOffset();
    }
  },

  methods: {
    // --> HELPERS <--

    autoAdaptOffset(): void {
      // Compute offset to apply (so that popover does not go off of screen)
      const popoverElement = (this.$refs.root as HTMLElement) || null;

      if (popoverElement !== null) {
        // Acquire previous offsets
        // Important: do not reset previously computed edges back to zero, as \
        //   the viewport may have changed size since last auto-adapt, and \
        //   the bounding client rectangle values will be computed from \
        //   previously-set offsets, therefore we want to start from there.
        const offsets = this.acquireOffsetAdapt();

        // Compute offsets from there
        const bounds = popoverElement.getBoundingClientRect(),
          maximums = [window.innerHeight, window.innerWidth],
          edges = [
            [bounds.top, bounds.bottom],
            [bounds.left, bounds.right]
          ];

        edges.forEach((edge, index) => {
          if (edge[0] < 0) {
            offsets[index] -= edge[0] + ADAPT_EDGE_OFFSET;
          } else if (edge[1] > maximums[index]) {
            offsets[index] -= edge[1] - maximums[index] + ADAPT_EDGE_OFFSET;
          } else {
            offsets[index] = 0;
          }
        });

        // Update with new offsets
        this.updateOffsetAdapt(offsets);
      }
    },

    acquireOffsetAdapt(): [number, number] {
      return [this.offsetAdapt.block, this.offsetAdapt.inline];
    },

    updateOffsetAdapt(offsets: [number, number]): void {
      this.offsetAdapt.block = offsets[0];
      this.offsetAdapt.inline = offsets[1];

      if (offsets[0] !== 0 || offsets[1] !== 0) {
        const translateValue = `${offsets[1]}px, ${offsets[0]}px`;

        this.offsetAdapt.transform = `translate(${translateValue})`;
      } else {
        this.offsetAdapt.transform = null;
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-popover";

.c-base-popover {
  background-color: rgb(var(--color-white));
  border: $size-base-popover-border-width solid
    rgb(var(--color-border-secondary));
  min-width: 180px;
  max-width: 360px;
  padding-block: 7px;
  border-radius: 5px;
  box-shadow: 0 2px 6px 0 rgba(var(--color-black), 0.025);
}
</style>
