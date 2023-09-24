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
      default: "blue",

      validator(x: string) {
        return ["blue", "grey"].includes(x);
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

.c-base-navigate-section {
  background-color: transparent;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  border-radius: 4px;

  #{$c}__icon {
    width: $icon-size;
    height: $icon-size;
    margin-inline-end: 9px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;

    #{$c}__icon-inner {
      fill: $color-white;
    }
  }

  #{$c}__text {
    flex: 1;

    #{$c}__text-title,
    #{$c}__text-label {
      display: block;
    }

    #{$c}__text-title {
      color: $color-text-primary;
      font-size: 14px;
      line-height: 16px;
    }

    #{$c}__text-label {
      color: $color-text-secondary;
      font-size: 12.75px;
      line-height: 15px;
      margin-block-start: 2px;
    }
  }

  #{$c}__arrow {
    fill: $color-white;
    margin-inline-start: 8px;
    flex: 0 0 auto;
    visibility: hidden;
  }

  &:hover {
    background-color: $color-base-grey-light;
  }

  &:active {
    background-color: darken($color-base-grey-light, 1.5%);
  }

  // --> COLORS <--

  &--blue {
    #{$c}__icon {
      background-color: $color-base-blue-dark;
    }

    &#{$c}--active {
      background-color: $color-base-blue-dark;

      &:hover {
        background-color: darken($color-base-blue-dark, 2%);
      }

      &:active {
        background-color: darken($color-base-blue-dark, 3%);
      }
    }
  }

  &--grey {
    #{$c}__icon {
      background-color: $color-base-grey-normal;
    }

    &#{$c}--active {
      background-color: $color-base-grey-dark;

      &:hover {
        background-color: darken($color-base-grey-dark, 2%);
      }

      &:active {
        background-color: darken($color-base-grey-dark, 3%);
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
          color: $color-text-reverse;
        }

        #{$c}__text-label {
          color: rgba($color-text-reverse, 0.7);
        }
      }

      #{$c}__arrow {
        visibility: visible;
      }
    }
  }
}
</style>
