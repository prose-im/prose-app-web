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
    "c-list-button",
    "c-list-button--" + size,
    "c-list-button--color-" + color,
    {
      "c-list-button--active": active,
      "c-list-button--important": important
    }
  ]`
)
  .c-list-button__icon(
    v-if="$slots.icon"
  )
    slot(
      name="icon"
    )

  div(
    :class=`[
      "c-list-button__label",
      {
        "u-medium": emphasis,
        "u-bold": important
      }
    ]`
  )
    slot

  .c-list-button__details(
    v-if="$slots.details"
  )
    slot(
      name="details"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "ListButton",

  props: {
    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["small", "medium"].includes(x);
      }
    },

    color: {
      type: String,
      default: "normal",

      validator(x: string) {
        return ["normal", "lighter"].includes(x);
      }
    },

    active: {
      type: Boolean,
      default: false
    },

    emphasis: {
      type: Boolean,
      default: false
    },

    important: {
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
$c: ".c-list-button";

.c-list-button {
  background-color: transparent;
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: darken($color-base-grey-light, 1%);
  }

  &:active {
    background-color: darken($color-base-grey-light, 2%);
  }

  #{$c}__icon {
    min-width: 22px;
    padding-inline-end: 7px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #{$c}__label {
    display: flex;
    align-items: center;
    flex: 1;
  }

  #{$c}__details {
    margin-inline-start: 6px;
    display: flex;
    flex: 0 0 auto;
  }

  // --> SIZES <--

  &--small {
    height: 28px;
    padding-inline: 10px;

    #{$c}__label {
      font-size: 13px;
    }
  }

  &--medium {
    height: 32px;
    padding-inline: 12px;

    #{$c}__label {
      font-size: 14px;
    }
  }

  // --> COLORS <--

  &--color-normal {
    #{$c}__label {
      color: $color-text-primary;
    }
  }

  &--color-lighter {
    #{$c}__label {
      color: lighten($color-text-primary, 26%);
    }
  }

  // --> BOOLEANS <--

  &--active {
    background-color: $color-base-blue-normal;

    &:hover {
      background-color: darken($color-base-blue-normal, 4%);
    }

    &:active {
      background-color: darken($color-base-blue-normal, 6%);
    }

    #{$c}__label {
      color: $color-white;
    }
  }

  &--important {
    &:nth-child(odd) {
      background-color: darken($color-base-grey-light, 0.75%);
    }

    &:nth-child(even) {
      background-color: lighten($color-base-grey-light, 0.25%);
    }

    &:hover {
      background-color: darken($color-base-grey-light, 2.5%);
    }

    &:active {
      background-color: darken($color-base-grey-light, 3.5%);
    }
  }
}
</style>
