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
    "c-form-select",
    "c-form-select--" + size,
    "c-form-select--" + align,
    {
      "c-form-select--visible": visible,
      "c-form-select--disabled": disabled,
      "c-form-select--loading": loading
    }
  ]`
)
  input(
    @change="onInputChange"
    :name="name"
    :value="value"
    type="text"
    ref="input"
    class="c-form-select__input"
  )

  .c-form-select__field(
    @click="onFieldClick"
  )
    .c-form-select__inner
      span(
        :class=`[
          "c-form-select__value",
          {
            "c-form-select__value--empty": !value
          }
        ]`
      )
        | {{ valueLabel || placeholder || "" }}

      base-icon(
        name="chevron.up"
        size="8px"
        class="c-form-select__arrow"
      )

  ul.c-form-select__options(
    v-if="visible"
  )
    li.c-form-select__option(
      v-for="option in options"
    )
      a(
        @click="onOptionClick(option)"
      )
        | {{ option.label }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// INTERFACES
export interface Option {
  value: string;
  label: string;
}

export default {
  name: "FormSelect",

  props: {
    modelValue: {
      type: String,
      default: null
    },

    options: {
      type: Array<Option>,
      required: true,

      validator(x: Array<Option>): boolean {
        return x.length > 0;
      }
    },

    name: {
      type: String,
      default: null
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

    align: {
      type: String,
      default: "center",

      validator(x: string) {
        return ["left", "center", "right"].includes(x);
      }
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

      value: "",

      visible: false
    };
  },

  computed: {
    valueLabel(): string {
      const option = this.options.find(option => {
        return this.value === option.value;
      });

      // Return inner label from corresponding option?
      if (option && option.label) {
        return option.label;
      }

      // Fallback on raw value
      return this.value;
    }
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

    onFieldClick(): void {
      this.visible = !this.visible;
    },

    onOptionClick(option: Option): void {
      const inputElement = this.$refs.input as HTMLInputElement;

      // Assign new value, and dispatch change event
      inputElement.value = option.value;

      inputElement.dispatchEvent(new Event("change"));

      // Hide options selector
      this.visible = false;
    },

    onInputChange(event: Event): void {
      // Update model value?
      if (event.target) {
        this.$emit(
          "update:modelValue",
          (event.target as HTMLInputElement).value
        );
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-select";

.c-form-select {
  position: relative;

  #{$c}__field,
  #{$c}__options {
    background-color: $color-white;
    border: $size-form-select-border-width solid rgba($color-black, 0.1);
    box-shadow: 0 2px 3px 0 rgba($color-black, 0.01);
  }

  #{$c}__input {
    display: none;
  }

  #{$c}__field {
    width: calc(100% - (2 * $size-form-select-border-width));
    padding-block: $size-form-select-padding-block;
    transition: border-color 150ms linear;
    border-radius: $size-form-select-border-radius;
    cursor: pointer;
    position: relative;
    z-index: 1;

    &:hover {
      border-color: rgba($color-black, 0.15);
    }

    &:active {
      border-color: rgba($color-black, 0.2);
    }

    #{$c}__inner {
      display: flex;
      align-items: center;
    }

    #{$c}__value {
      color: $color-text-primary;
      flex: 1;

      &--empty {
        color: $color-text-secondary;
      }
    }

    #{$c}__arrow {
      fill: $color-text-tertiary;
      flex: 0 0 auto;
    }
  }

  #{$c}__options {
    border-block-end: 0 none;
    padding-block: 3px;
    position: absolute;
    inset-inline: 0;
    inset-block-end: 100%;
    z-index: 0;
    border-top-left-radius: $size-form-select-border-radius;
    border-top-right-radius: $size-form-select-border-radius;

    #{$c}__option {
      line-height: 28px;

      &,
      a {
        display: block;
      }

      a {
        background-color: transparent;
        color: $color-text-primary;
        transition: none;

        &:hover,
        &:active {
          color: $color-text-reverse;
        }

        &:hover {
          background-color: $color-base-purple-normal;
        }

        &:active {
          background-color: darken($color-base-purple-normal, 6%);
        }
      }
    }
  }

  // --> SIZES <--

  &--medium {
    #{$c}__field,
    #{$c}__options {
      font-size: 11.5px;
    }

    #{$c}__field {
      #{$c}__value {
        line-height: $size-form-select-medium-line-height;
      }
    }

    #{$c}__field #{$c}__inner,
    #{$c}__options #{$c}__option a {
      padding-inline-start: $size-form-select-medium-padding-sides;
      padding-inline-end: $size-form-select-medium-padding-sides;
    }
  }

  &--mid-medium {
    #{$c}__field,
    #{$c}__options {
      font-size: 12.5px;
    }

    #{$c}__field {
      #{$c}__value {
        line-height: $size-form-select-mid-medium-line-height;
      }
    }

    #{$c}__field #{$c}__inner,
    #{$c}__options #{$c}__option a {
      padding-inline-start: $size-form-select-mid-medium-padding-sides;
      padding-inline-end: $size-form-select-mid-medium-padding-sides;
    }
  }

  &--large {
    #{$c}__field,
    #{$c}__options {
      font-size: 14.5px;
    }

    #{$c}__field {
      #{$c}__value {
        line-height: $size-form-select-large-line-height;
      }
    }

    #{$c}__field #{$c}__inner,
    #{$c}__options #{$c}__option a {
      padding-inline-start: $size-form-select-large-padding-sides;
      padding-inline-end: $size-form-select-large-padding-sides;
    }
  }

  &--mid-large {
    #{$c}__field,
    #{$c}__options {
      font-size: 15.5px;
    }

    #{$c}__field {
      #{$c}__value {
        line-height: $size-form-select-mid-large-line-height;
      }
    }

    #{$c}__field #{$c}__inner,
    #{$c}__options #{$c}__option a {
      padding-inline-start: $size-form-select-mid-large-padding-sides;
      padding-inline-end: $size-form-select-mid-large-padding-sides;
    }
  }

  &--ultra-large {
    #{$c}__field,
    #{$c}__options {
      font-size: 16.5px;
    }

    #{$c}__field {
      #{$c}__value {
        line-height: $size-form-select-ultra-large-line-height;
      }
    }

    #{$c}__field #{$c}__inner,
    #{$c}__options #{$c}__option a {
      padding-inline-start: $size-form-select-ultra-large-padding-sides;
      padding-inline-end: $size-form-select-ultra-large-padding-sides;
    }
  }

  // --> ALIGNS <--

  &--left {
    #{$c}__field,
    #{$c}__options {
      text-align: left;
    }
  }

  &--center {
    #{$c}__field,
    #{$c}__options {
      text-align: center;
    }
  }

  &--right {
    #{$c}__field,
    #{$c}__options {
      text-align: right;
    }
  }

  // --> BOOLEANS <--

  &--visible {
    #{$c}__field,
    #{$c}__options {
      &,
      &:hover,
      &:active {
        border-color: rgba($color-black, 0.125);
      }
    }

    #{$c}__field {
      border-top-left-radius: 0;
      border-top-right-radius: 0;

      #{$c}__arrow {
        transform: scaleY(-1);
      }
    }
  }

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }
  }
}
</style>
