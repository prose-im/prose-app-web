<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
a(
  :class=`[
    "c-base-navigate-section",
    "c-base-navigate-section--" + color,
    {
      "c-base-navigate-section--active": active
    }
  ]`
)
  span.c-base-navigate-section__icon
    base-icon(
      :name="icon"
      size="14px"
      class="c-base-navigate-section__icon-inner"
    )

  span.c-base-navigate-section__text
    span.c-base-navigate-section__text-title.u-medium
      | {{ title }}

    span.c-base-navigate-section__text-label(
      v-if="label"
    )
      | {{ label }}

  base-icon(
    name="chevron.right.circle.fill"
    size="15px"
    class="c-base-navigate-section__arrow"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseNavigateSection",

  props: {
    title: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      required: true
    },

    label: {
      type: String,
      default: ""
    },

    color: {
      type: String,
      default: "accent",

      validator(x: string) {
        return ["accent"].includes(x);
      }
    },

    active: {
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
$c: ".c-base-navigate-section";

// VARIABLES
$icon-size: 28px;

#{$c} {
  background-color: transparent;
  padding: 5px 10px;
  display: flex;
  align-items: center;

  &,
  #{$c}__icon {
    border-radius: $size-common-inner-border-radius;
  }

  #{$c}__icon {
    width: $icon-size;
    height: $icon-size;
    margin-inline-end: 9px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;

    #{$c}__icon-inner {
      fill: rgb(var(--color-accent-text));
    }
  }

  #{$c}__text {
    flex: 1;

    #{$c}__text-title,
    #{$c}__text-label {
      display: block;
    }

    #{$c}__text-title {
      color: rgb(var(--color-text-primary));
      font-size: $font-size-baseline;
      line-height: 16px;
    }

    #{$c}__text-label {
      color: rgb(var(--color-text-secondary));
      font-size: ($font-size-baseline - 1.25px);
      line-height: 15px;
      margin-block-start: 2px;
    }
  }

  #{$c}__arrow {
    fill: rgb(var(--color-accent-text));
    margin-inline-start: 8px;
    flex: 0 0 auto;
    visibility: hidden;
  }

  &:hover {
    background-color: rgb(var(--color-base-grey-light));
  }

  &:active {
    background-color: darken-var(var(--color-base-grey-light), 1.5%);
  }

  // --> COLORS <--

  &--accent {
    #{$c}__icon {
      background-color: rgb(var(--color-accent-background-dark));
    }

    &#{$c}--active {
      background-color: rgb(var(--color-accent-background-dark));

      &:hover {
        background-color: darken-var(var(--color-accent-background-dark), 2%);
      }

      &:active {
        background-color: darken-var(var(--color-accent-background-dark), 3%);
      }
    }
  }

  // --> BOOLEANS <--

  &--active {
    &,
    &:hover,
    &:active {
      #{$c}__icon {
        background-color: transparent;
      }

      #{$c}__text {
        #{$c}__text-title {
          color: rgb(var(--color-accent-text));
        }

        #{$c}__text-label {
          color: rgba(var(--color-accent-text), 0.7);
        }
      }

      #{$c}__arrow {
        visibility: visible;
      }
    }
  }
}
</style>
