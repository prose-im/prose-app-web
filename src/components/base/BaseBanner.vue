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
    "c-base-banner",
    "c-base-banner--" + color,
    {
      "c-base-banner--squared": squared
    }
  ]`
)
  base-icon(
    :name="icon"
    size="16px"
    class="c-base-banner__icon"
  )

  p.c-base-banner__title.u-medium
    | {{ title }}

  p.c-base-banner__description.u-ellipsis
    | {{ description }}

  .c-base-banner__action(
    v-if="$slots.action"
  )
    slot(
      name="action"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseBanner",

  props: {
    icon: {
      type: String,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    color: {
      type: String,
      default: "grey",

      validator(x: string) {
        return ["white", "grey", "blue", "red", "orange"].includes(x);
      }
    },

    squared: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-banner";

#{$c} {
  color: rgb(var(--color-text-reverse));
  min-height: 26px;
  padding-inline: 20px;
  padding-block: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  border-radius: $size-common-inner-border-radius;

  #{$c}__icon,
  #{$c}__title,
  #{$c}__action {
    flex: 0 0 auto;
  }

  #{$c}__icon,
  #{$c}__title,
  #{$c}__description {
    margin-block-end: 2px;
  }

  #{$c}__icon {
    fill: rgb(var(--color-text-reverse));
    margin-inline-end: 24px;
  }

  #{$c}__title {
    font-size: ($font-size-baseline - 0.5px);
    line-height: 17px;
    letter-spacing: 0.15px;
  }

  #{$c}__description {
    font-size: ($font-size-baseline - 1.5px);
    line-height: 15px;
    letter-spacing: 0.05px;
    margin-inline-start: 16px;
    flex: 1;
    opacity: 0.6;
  }

  #{$c}__action {
    margin-inline-start: 10px;
  }

  // --> COLORS <--

  &--white {
    background-color: rgb(var(--color-base-grey-normal));

    #{$c}__description {
      opacity: 0.85;
    }
  }

  &--grey {
    background-color: rgb(var(--color-base-grey-dark));
  }

  &--blue {
    background-color: rgb(var(--color-base-blue-dark));
  }

  &--red {
    background-color: rgb(var(--color-base-red-normal));
  }

  &--orange {
    background-color: rgb(var(--color-base-orange-dark));
  }

  // --> BOOLEANS <--

  &--squared {
    border-radius: 0;
  }
}
</style>
