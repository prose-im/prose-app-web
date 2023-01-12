<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
button(
  @click="onClick"
  :class=`[
    "c-base-button",
    "c-base-button--" + size,
    "c-base-button--" + tint,
    {
      "c-base-button--reverse": reverse
    }
  ]`
  :type="type"
)
  .c-base-button__inner
    div(
      :class=`[
        "c-base-button__label",
        {
          "u-medium": !bolder,
          "u-bold": bolder
        }
      ]`
    )
      slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseButton",

  props: {
    type: {
      type: String,
      default: "button",

      validator(x) {
        return ["button", "submit"].includes(x);
      }
    },

    tint: {
      type: String,
      default: "dark",

      validator(x) {
        return ["light", "dark"].includes(x);
      }
    },

    size: {
      type: String,
      default: "large",

      validator(x) {
        return [
          "medium",
          "mid-medium",
          "large",
          "mid-large",
          "ultra-large"
        ].includes(x);
      }
    },

    bolder: {
      type: Boolean,
      default: false
    },

    reverse: {
      type: Boolean,
      default: false
    }
  },

  emits: ["click"],

  methods: {
    // --> EVENT LISTENERS <--

    /**
     * Triggers button is clicked
     * @public
     * @param  {object} event
     * @return {undefined}
     */
    onClick(event) {
      // Re-emit click event
      this.$emit("click", event);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss" scoped>
$c: ".c-base-button";

// VARIABLES
$color-button-dark-normal: $color-base-purple-normal;
$color-button-dark-reverse: $color-white;
$color-button-light-normal: rgba(#4f4e58, 0.04);
$color-button-light-reverse: rgba($color-black, 0.11);

$size-medium-padding-sides: 16px;
$size-mid-medium-padding-sides: 20px;
$size-large-padding-sides: 24px;
$size-mid-large-padding-sides: 34px;
$size-ultra-large-padding-sides: 44px;

.c-base-button {
  background: transparent;
  border: 0 none;
  margin: 0;
  padding: 0;
  display: inline-block;

  &:active {
    #{$c}__inner {
      transform: translateY(1px);
    }
  }

  #{$c}__inner {
    border: 1px solid rgba($color-black, 0.5);
    text-align: center;
    user-select: none;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 10px;
    transition: all 100ms linear;
    transition-property: transform, box-shadow, background-color;

    #{$c}__label {
      flex: 1;
    }
  }

  // --> TINTS <--

  &--dark {
    #{$c}__inner {
      background-color: $color-button-dark-normal;
      box-shadow: 0 4px 4px 0 rgba($color-button-dark-normal, 0.04),
        inset 0 1px 0 0 rgba($color-white, 0.15);

      #{$c}__label {
        color: $color-white;
      }
    }

    &:hover {
      #{$c}__inner {
        background-color: lighten($color-button-dark-normal, 6%);
      }
    }

    &:active {
      #{$c}__inner {
        background-color: lighten($color-button-dark-normal, 2%);
        box-shadow: 0 1px 1px 0 rgba($color-button-dark-normal, 0.12);
      }
    }
  }

  &--light {
    #{$c}__inner {
      background-color: $color-button-light-normal;

      #{$c}__label {
        color: $color-black;
      }
    }

    &:hover {
      #{$c}__inner {
        background-color: darken($color-button-light-normal, 100%);
      }
    }

    &:active {
      #{$c}__inner {
        background-color: darken($color-button-light-normal, 50%);
      }
    }
  }

  // --> SIZES <--

  &--medium {
    #{$c}__inner {
      font-size: 10px;
      line-height: 25px;
      padding-left: $size-medium-padding-sides;
      padding-right: $size-medium-padding-sides;
    }
  }

  &--mid-medium {
    #{$c}__inner {
      font-size: 12px;
      line-height: 32px;
      padding-left: $size-mid-medium-padding-sides;
      padding-right: $size-mid-medium-padding-sides;
    }
  }

  &--large {
    #{$c}__inner {
      font-size: 14px;
      line-height: 42px;
      padding-left: $size-large-padding-sides;
      padding-right: $size-large-padding-sides;
    }
  }

  &--mid-large {
    #{$c}__inner {
      font-size: 15px;
      line-height: 48px;
      padding-left: $size-mid-large-padding-sides;
      padding-right: $size-mid-large-padding-sides;
    }
  }

  &--ultra-large {
    #{$c}__inner {
      font-size: 16px;
      line-height: 58px;
      padding-left: $size-ultra-large-padding-sides;
      padding-right: $size-ultra-large-padding-sides;
    }
  }

  // --> BOOLEANS <--

  &--reverse {
    &#{$c}--dark {
      #{$c}__inner {
        background-color: $color-button-dark-reverse;
        border-color: $color-button-dark-normal;

        #{$c}__label {
          color: $color-button-dark-normal;
        }
      }
    }

    &#{$c}--light {
      #{$c}__inner {
        background-color: $color-button-light-reverse;

        #{$c}__label {
          color: $color-black;
        }
      }

      &:hover {
        #{$c}__inner {
          background-color: rgba($color-black, 0.14);
        }
      }

      &:active {
        #{$c}__inner {
          background-color: rgba($color-black, 0.15);
        }
      }
    }
  }
}
</style>
