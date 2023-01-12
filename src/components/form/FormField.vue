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
    "c-form-field",
    "c-form-field--" + size
  ]`
)
  input.c-form-field__input(
    :type="type"
    :name="name"
    :placeholder="placeholder"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "FormField",

  props: {
    type: {
      type: String,
      default: "text",
      required: true
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

    name: {
      type: String,
      default: null
    },

    placeholder: {
      type: String,
      default: null
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss" scoped>
$c: ".c-form-field";

// VARIABLES
$size-medium-padding-sides: 10px;
$size-mid-medium-padding-sides: 14px;
$size-large-padding-sides: 18px;
$size-mid-large-padding-sides: 22px;
$size-ultra-large-padding-sides: 24px;

.c-form-field {
  display: inline-block;

  #{$c}__input {
    background-color: $color-white;
    border: 1px solid rgba($color-black, 0.1);
    text-align: center;
    border-radius: 10px;
    transition: all 100ms linear;
    transition-property: box-shadow, border-color;
    box-shadow: 0 3px 4px 0 rgba($color-black, 0.01),
      inset 0 1px 2px 0 rgba($color-black, 0.04);

    &:hover {
      border-color: rgba($color-black, 0.15);
    }

    &:focus {
      border-color: rgba($color-black, 0.2);
      box-shadow: 0 3px 4px 0 rgba($color-black, 0.1),
        inset 0 1px 2px 0 rgba($color-black, 0.04);
    }
  }

  // --> SIZES <--

  &--medium {
    #{$c}__input {
      font-size: 10px;
      line-height: 25px;
      width: calc(100% - #{(2 * $size-medium-padding-sides)});
      padding-left: $size-medium-padding-sides;
      padding-right: $size-medium-padding-sides;
    }
  }

  &--mid-medium {
    #{$c}__input {
      font-size: 12px;
      line-height: 32px;
      width: calc(100% - #{(2 * $size-mid-medium-padding-sides)});
      padding-left: $size-mid-medium-padding-sides;
      padding-right: $size-mid-medium-padding-sides;
    }
  }

  &--large {
    #{$c}__input {
      font-size: 14px;
      line-height: 42px;
      width: calc(100% - #{(2 * $size-large-padding-sides)});
      padding-left: $size-large-padding-sides;
      padding-right: $size-large-padding-sides;
    }
  }

  &--mid-large {
    #{$c}__input {
      font-size: 15px;
      line-height: 48px;
      width: calc(100% - #{(2 * $size-mid-large-padding-sides)});
      padding-left: $size-mid-large-padding-sides;
      padding-right: $size-mid-large-padding-sides;
    }
  }

  &--ultra-large {
    #{$c}__input {
      font-size: 16px;
      line-height: 58px;
      width: calc(100% - #{(2 * $size-ultra-large-padding-sides)});
      padding-left: $size-ultra-large-padding-sides;
      padding-right: $size-ultra-large-padding-sides;
    }
  }
}
</style>
