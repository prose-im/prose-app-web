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
    {
      "c-base-navigate-section--active": active
    }
  ]`
)
  span.c-base-navigate-section__icon

  span.c-base-navigate-section__text
    span.c-base-navigate-section__text-title.u-medium
      | {{ title }}

    span.c-base-navigate-section__text-label
      | {{ label }}

  span.c-base-navigate-section__arrow
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

    label: {
      type: String,
      required: true
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

.c-base-navigate-section {
  background-color: transparent;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  border-radius: 4px;

  #{$c}__icon {
    margin-inline-end: 8px;
    flex: 0 0 auto;
  }

  #{$c}__text {
    flex: 1;

    #{$c}__text-title,
    #{$c}__text-label {
      display: block;
    }

    #{$c}__text-title {
      color: $color-text-primary;
      font-size: 15.5px;
      line-height: 17px;
    }

    #{$c}__text-label {
      color: $color-text-secondary;
      font-size: 14px;
      line-height: 15px;
      margin-block-start: 2px;
    }
  }

  #{$c}__arrow {
    margin-inline-start: 10px;
    flex: 0 0 auto;
  }

  &:hover {
    background-color: $color-base-grey-light;
  }

  &:active {
    background-color: darken($color-base-grey-light, 1.5%);
  }

  // --> BOOLEANS <--

  &--active {
    &,
    &:hover,
    &:active {
      background-color: $color-base-blue-dark;

      #{$c}__text {
        #{$c}__text-title {
          color: $color-text-reverse;
        }

        #{$c}__text-label {
          color: rgba($color-text-reverse, 0.7);
        }
      }
    }
  }
}
</style>
