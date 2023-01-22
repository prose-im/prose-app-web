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
    "c-form-field--" + size,
    {
      "c-form-field--disabled": disabled,
      "c-form-field--loading": loading
    }
  ]`
)
  textarea.c-form-field__inner.c-form-field__inner--textarea(
    v-if="type === 'textarea'"
    @input="onFieldInput"
    :name="name"
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    rows="1"
    ref="field"
  )

  input.c-form-field__inner.c-form-field__inner--input(
    v-else
    @input="onFieldInput"
    :type="type"
    :name="name"
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    ref="field"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "FormField",

  props: {
    modelValue: {
      type: [String, Number],
      default: null
    },

    type: {
      type: String,
      default: "text",
      required: true,

      validator(x: string) {
        return [
          "text",
          "password",
          "number",
          "email",
          "url",
          "textarea"
        ].includes(x);
      }
    },

    size: {
      type: String,
      default: "large",

      validator(x: string) {
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
    },

    disabled: {
      type: Boolean,
      default: false
    },

    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["update:modelValue"],

  data() {
    return {
      // --> STATE <--

      value: ""
    };
  },

  watch: {
    modelValue: {
      immediate: true,

      handler(value) {
        this.value = value;
      }
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onFieldInput(): void {
      let inputValue = this.$refs.field.value || "";

      // Convert raw input value to number?
      if (inputValue && this.type === "number") {
        inputValue = Number(inputValue);
      }

      // Update model value
      this.$emit("update:modelValue", inputValue);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-field";

// VARIABLES
$size-medium-padding-sides: 10px;
$size-mid-medium-padding-sides: 14px;
$size-large-padding-sides: 18px;
$size-mid-large-padding-sides: 22px;
$size-ultra-large-padding-sides: 24px;

.c-form-field {
  display: inline-block;

  #{$c}__inner {
    background-color: $color-white;
    border: 1px solid rgba($color-black, 0.1);
    color: $color-text-primary;
    outline: 2px solid transparent;
    font-family: inherit;
    width: 100%;
    transition: all 150ms linear;
    transition-property: box-shadow, border-color, outline-color;
    border-radius: 10px;
    box-sizing: border-box;
    box-shadow: 0 3px 4px 0 rgba($color-black, 0.01),
      inset 0 1px 2px 0 rgba($color-black, 0.04);

    &--input {
      text-align: center;
    }

    &--textarea {
      height: 100%;
      resize: none;
    }

    &::placeholder {
      color: $color-text-secondary;
      opacity: 1;
    }

    &:hover {
      border-color: rgba($color-base-purple-normal, 0.5);
    }

    &:focus {
      border-color: $color-base-purple-normal;
      outline-color: rgba($color-base-purple-normal, 0.2);
      box-shadow: 0 3px 4px 0 rgba($color-black, 0.1),
        inset 0 1px 2px 0 rgba($color-black, 0.04);
    }
  }

  // --> SIZES <--

  &--medium {
    #{$c}__inner {
      font-size: 11px;
      padding-inline-start: $size-medium-padding-sides;
      padding-inline-end: $size-medium-padding-sides;

      &--input {
        line-height: 25px;
      }

      &--textarea {
        line-height: 16px;
        padding-block: 7px;
      }
    }
  }

  &--mid-medium {
    #{$c}__inner {
      font-size: 13px;
      padding-inline-start: $size-mid-medium-padding-sides;
      padding-inline-end: $size-mid-medium-padding-sides;

      &--input {
        line-height: 32px;
      }

      &--textarea {
        line-height: 18px;
        padding-block: 9px;
      }
    }
  }

  &--large {
    #{$c}__inner {
      font-size: 15px;
      padding-inline-start: $size-large-padding-sides;
      padding-inline-end: $size-large-padding-sides;

      &--input {
        line-height: 42px;
      }

      &--textarea {
        line-height: 20px;
        padding-block: 11px;
      }
    }
  }

  &--mid-large {
    #{$c}__inner {
      font-size: 16px;
      padding-inline-start: $size-mid-large-padding-sides;
      padding-inline-end: $size-mid-large-padding-sides;

      &--input {
        line-height: 48px;
      }

      &--textarea {
        line-height: 21px;
        padding-block: 12px;
      }
    }
  }

  &--ultra-large {
    #{$c}__inner {
      font-size: 17px;
      padding-inline-start: $size-ultra-large-padding-sides;
      padding-inline-end: $size-ultra-large-padding-sides;

      &--input {
        line-height: 58px;
      }

      &--textarea {
        line-height: 22px;
        padding-block: 13px;
      }
    }
  }

  // --> BOOLEANS <--

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }

    #{$c}__inner {
      background-color: rgba($color-base-grey-light, 0.6);
      color: $color-text-secondary;
      pointer-events: none;

      &::placeholder {
        color: $color-text-tertiary;
      }
    }
  }
}
</style>
