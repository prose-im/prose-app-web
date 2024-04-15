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
  v-show="isRevealed"
  :style="cardStyle"
)
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const REVEAL_DELAY = 250; // 1/4 second

export default {
  name: "BaseCard",

  props: {
    anchor: {
      type: Array<number>,
      required: true,

      validator(x: Array<number>): boolean {
        return x.length === 2;
      }
    }
  },

  data() {
    return {
      // --> STATE <--

      isRevealed: false,

      revealTimeout: null as null | ReturnType<typeof setTimeout>
    };
  },

  computed: {
    cardStyle(): { [property: string]: string } {
      return {
        insetInlineStart: `${this.anchor[0]}px`,
        insetBlockStart: `${this.anchor[1]}px`
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
        }, REVEAL_DELAY);
      }
    },

    unscheduleReveal(): void {
      if (this.revealTimeout !== null) {
        clearTimeout(this.revealTimeout);

        this.revealTimeout = null;
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-card";

// VARIABLES
$card-border-width: 1px;

#{$c} {
  background-color: rgb(var(--color-white));
  border: $card-border-width solid rgb(var(--color-border-secondary));
  font-size: 12px;
  line-height: 15px;
  margin-inline-start: -$card-border-width;
  margin-block-start: -($card-border-width + 2px);
  padding: 9px 11px;
  position: absolute;
  z-index: $index-foreground-quaternary;
  transform: translateY(-100%);
  border-radius: 6px;
  box-shadow: 0 4px 14px 0 rgba(var(--color-shadow-primary), 0.05);
}
</style>
