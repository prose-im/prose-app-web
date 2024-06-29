<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-card(
  v-if="isRevealed"
  :style="cardStyle"
  ref="root"
)
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const REVEAL_DELAY = 350; // 350 milliseconds

const ADAPT_EDGE_BORDER_OFFSET = 1;
const ADAPT_EDGE_BLOCK_OFFSET = 3;

export default {
  name: "BaseCard",

  props: {
    adapt: {
      type: Boolean,
      default: true
    },

    anchor: {
      type: Array<number>,
      required: true,

      validator(x: Array<number>): boolean {
        return x.length === 2;
      }
    },

    bounds: {
      type: Array<number>,
      default: null,

      validator(x: Array<number>): boolean {
        return x.length === 2;
      }
    },

    origin: {
      type: Array<number>,
      default: null,

      validator(x: Array<number>): boolean {
        return x.length === 2;
      }
    }
  },

  data() {
    return {
      // --> STATE <--

      isRevealed: false,

      offsetAdapt: {
        block: 0,
        inline: 0
      },

      revealTimeout: null as null | ReturnType<typeof setTimeout>
    };
  },

  computed: {
    cardStyle(): { [property: string]: string } {
      const offsets = this.acquireOffsetAdapt();

      return {
        insetInlineStart: `${this.anchor[0] + offsets[1]}px`,
        insetBlockStart: `${this.anchor[1] + offsets[0]}px`
      };
    }
  },

  mounted() {
    this.scheduleReveal();
  },

  beforeUnmount() {
    this.unscheduleReveal();
  },

  methods: {
    // --> HELPERS <--

    scheduleReveal(): void {
      if (this.revealTimeout === null) {
        this.revealTimeout = setTimeout(() => {
          this.revealTimeout = null;

          this.isRevealed = true;

          // Automatically adapt card offset?
          if (this.adapt === true) {
            this.$nextTick(this.autoAdaptOffset);
          }
        }, REVEAL_DELAY);
      }
    },

    unscheduleReveal(): void {
      if (this.revealTimeout !== null) {
        clearTimeout(this.revealTimeout);

        this.revealTimeout = null;
      }
    },

    autoAdaptOffset(): void {
      // Compute offset to apply (so that card does not go off of screen)
      const cardElement = (this.$refs.root as HTMLElement) || null;

      if (cardElement !== null) {
        // Acquire previous offsets
        const offsets = this.acquireOffsetAdapt();

        // Compute offsets from there
        const cardBounds = cardElement.getBoundingClientRect();

        if (
          cardBounds.top <= this.bounds[1] + ADAPT_EDGE_BLOCK_OFFSET &&
          this.origin !== null
        ) {
          // Card goes out of view (at top corner, correct offsets)
          offsets[0] +=
            this.origin[1] +
            cardBounds.height +
            ADAPT_EDGE_BLOCK_OFFSET +
            ADAPT_EDGE_BORDER_OFFSET;
        } else {
          // Card does not get out of view (add regular edge offsets)
          offsets[0] -= ADAPT_EDGE_BLOCK_OFFSET + ADAPT_EDGE_BORDER_OFFSET;
        }

        offsets[1] -= ADAPT_EDGE_BORDER_OFFSET;

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
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-card";

#{$c} {
  background-color: rgb(var(--color-white));
  border: 1px solid rgb(var(--color-border-secondary));
  font-size: ($font-size-baseline - 2px);
  line-height: 15px;
  padding: 9px 11px;
  position: absolute;
  z-index: $index-foreground-quaternary;
  transform: translateY(-100%);
  border-radius: 6px;
  box-shadow: 0 4px 14px 0 rgba(var(--color-shadow-primary), 0.05);
}
</style>
