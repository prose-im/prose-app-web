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
      "c-list-button--disabled": disabled,
      "c-list-button--actionable": actionable,
      "c-list-button--important": important
    }
  ]`
)
  div(
    v-if="$slots.icon"
    :class=`[
      "c-list-button__icon",
      {
        [iconClass]: iconClass
      }
    ]`
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

  slot(
    name="expanded"
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
        return ["normal", "lighter", "blue", "red"].includes(x);
      }
    },

    active: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    actionable: {
      type: Boolean,
      default: true
    },

    emphasis: {
      type: Boolean,
      default: false
    },

    important: {
      type: Boolean,
      default: false
    },

    iconClass: {
      type: String,
      default: null
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
  cursor: default;

  &:hover {
    background-color: darken($color-base-grey-light, 1%);
  }

  #{$c}__icon {
    min-width: 22px;
    padding-inline-end: $size-list-item-icon-padding-inline-end;
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
    margin-inline-start: $size-list-item-details-margin-inline-start;
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

  &--color-blue,
  &--color-red {
    &:hover,
    &#{$c}--actionable:active {
      #{$c}__label {
        color: $color-white;
      }
    }
  }

  &--color-blue {
    #{$c}__label {
      color: $color-base-blue-normal;
    }

    &:hover {
      background-color: $color-base-blue-normal;
    }

    &#{$c}--actionable:active {
      background-color: darken($color-base-blue-normal, 4%);
    }
  }

  &--color-red {
    #{$c}__label {
      color: $color-base-red-normal;
    }

    &:hover {
      background-color: $color-base-red-normal;
    }

    &#{$c}--actionable:active {
      background-color: darken($color-base-red-normal, 4%);
    }
  }

  // --> BOOLEANS <--

  &--actionable {
    cursor: pointer;

    &:active {
      background-color: darken($color-base-grey-light, 2%);
    }
  }

  &--active {
    background-color: $color-base-blue-normal;

    &:hover {
      background-color: darken($color-base-blue-normal, 4%);
    }

    &#{$c}--actionable:active {
      background-color: darken($color-base-blue-normal, 6%);
    }

    #{$c}__label {
      color: $color-white;
    }
  }

  &--disabled {
    opacity: 0.45;
    pointer-events: none;
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

    &#{$c}--actionable:active {
      background-color: darken($color-base-grey-light, 3.5%);
    }
  }
}
</style>
