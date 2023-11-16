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
      default: "blue",

      validator(x: string) {
        return ["blue", "white"].includes(x);
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

.c-base-count {
  font-size: 12px;
  text-align: center;
  line-height: $count-size-base;
  padding-inline: $count-padding-sides;
  min-width: ($count-size-base - (2 * $count-padding-sides));
  border-radius: 4px;

  #{$c}__icon {
    margin-block-end: -1.5px;
  }

  // --> COLORS <--

  &--blue {
    background-color: rgb(var(--color-base-blue-normal));
    color: rgb(var(--color-white));

    #{$c}__icon {
      fill: rgb(var(--color-white));
    }
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
