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
  :class=`[
    "c-base-count",
    "u-medium",
    "c-base-count--" + color
  ]`
)
  base-icon(
    v-if="icon"
    :name="icon"
    size="12px"
    class="c-base-count__icon"
  )

  template(
    v-else
  )
    | {{ count }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseCount",

  props: {
    count: {
      type: Number,
      default: 0
    },

    icon: {
      type: String,
      default: null
    },

    color: {
      type: String,
      default: "accent",

      validator(x: string) {
        return ["accent", "blue", "red", "white"].includes(x);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-count";

// VARIABLES
$count-size-base: 20px;
$count-padding-sides: 5px;

#{$c} {
  font-size: ($font-size-baseline - 2px);
  text-align: center;
  line-height: $count-size-base;
  padding-inline: $count-padding-sides;
  min-width: ($count-size-base - (2 * $count-padding-sides));
  border-radius: 5px;

  #{$c}__icon {
    margin-block-end: -1.5px;
  }

  // --> COLORS <--

  &--blue,
  &--red {
    color: rgb(var(--color-white));

    #{$c}__icon {
      fill: rgb(var(--color-white));
    }
  }

  &--accent {
    background-color: rgb(var(--color-accent-background-normal));
    color: rgb(var(--color-accent-text));

    #{$c}__icon {
      fill: rgb(var(--color-accent-text));
    }
  }

  &--blue {
    background-color: rgb(var(--color-base-blue-normal));
  }

  &--red {
    background-color: rgb(var(--color-base-red-normal));
  }

  &--white {
    background-color: rgb(var(--color-white));
    color: rgb(var(--color-black));

    #{$c}__icon {
      fill: rgb(var(--color-black));
    }
  }
}
</style>
