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
    "c-form-select--" + position,
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
      component(
        v-if="icon && value"
        v-bind="icon.properties(value)"
        :is="icon.component"
        class="c-form-select__icon"
      )

      span(
        :class=`[
          "c-form-select__value",
          "u-ellipsis",
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
    v-click-away="onOptionsClickAway"
    v-hotkey.prevent.stop="hotkeys"
    ref="options"
  )
    li(
      v-for="(option, index) in options"
      @mouseenter="onOptionMouseEnter(index)"
      :class=`[
        "c-form-select__option",
        {
          "u-medium": (value === option.value),
          "c-form-select__option--selected": (value === option.value),
          "c-form-select__option--hovered": (hoveredIndex === index)
        }
      ]`
    )
      a(
        @click="onOptionClick(option)"
      )
        component(
          v-if="icon"
          v-bind="icon.properties(option.value)"
          :is="icon.component"
          class="c-form-select__icon"
        )

        span.c-form-select__value.u-ellipsis
          | {{ option.label }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";

// INTERFACES
export interface Option {
  value: string;
  label: string;
}

export interface Icon {
  component: object;
  properties: (value: string) => object;
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

    icon: {
      type: Object as PropType<Icon>,
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

    position: {
      type: String,
      default: "top",

      validator(x: string) {
        return ["top", "bottom"].includes(x);
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

      hoveredIndex: -1,

      visible: false
    };
  },

  computed: {
    hasOptions(): boolean {
      return this.options.length > 0;
    },

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
    },

    hotkeys() {
      return {
        enter: this.onHotkeyEnter,
        esc: this.onHotkeyEscape,
        down: this.onHotkeyDown,
        up: this.onHotkeyUp
      };
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
    // --> HELPERS <--

    selectOption(option: Option): void {
      const inputElement = this.$refs.input as HTMLInputElement;

      // Assign new value, and dispatch change event
      inputElement.value = option.value;

      inputElement.dispatchEvent(new Event("change"));

      // Hide options selector
      this.hideOptions();
    },

    hideOptions(): void {
      this.visible = false;
    },

    scrollToOptionIndex(index: number): void {
      const optionsElement = (this.$refs.options as HTMLElement) || null;

      if (optionsElement !== null) {
        const optionElement = optionsElement.children[index] || null;

        if (optionElement !== null) {
          optionElement.scrollIntoView({
            behavior: "auto",
            block: "nearest"
          });
        }
      }
    },

    // --> EVENT LISTENERS <--

    onHotkeyEnter(): void {
      if (this.hasOptions === true && this.hoveredIndex >= 0) {
        const selectedOption = this.options[this.hoveredIndex] || null;

        if (selectedOption !== null) {
          this.selectOption(selectedOption);
        }
      }
    },

    onHotkeyEscape(): void {
      // Hide options selector
      this.hideOptions();
    },

    onHotkeyDown(): void {
      if (this.hasOptions === true) {
        const nextHoveredIndex = this.hoveredIndex + 1;

        if (nextHoveredIndex < this.options.length) {
          this.hoveredIndex = nextHoveredIndex;
        } else {
          this.hoveredIndex = 0;
        }

        this.scrollToOptionIndex(this.hoveredIndex);
      }
    },

    onHotkeyUp(): void {
      if (this.hasOptions === true) {
        const previousHoveredIndex = this.hoveredIndex - 1;

        if (previousHoveredIndex >= 0) {
          this.hoveredIndex = previousHoveredIndex;
        } else {
          this.hoveredIndex = this.options.length - 1;
        }

        this.scrollToOptionIndex(this.hoveredIndex);
      }
    },

    onFieldClick(): void {
      this.visible = !this.visible;
    },

    onOptionsClickAway(): void {
      // Hide options selector
      this.hideOptions();
    },

    onOptionMouseEnter(index: number): void {
      if (this.hoveredIndex !== index) {
        this.hoveredIndex = index;
      }
    },

    onOptionClick(option: Option): void {
      this.selectOption(option);
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

  #{$c}__field,
  #{$c}__options #{$c}__option {
    #{$c}__icon {
      margin-inline-end: 9px;
      flex: 0 0 auto;
    }

    #{$c}__value {
      flex: 1;
    }
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
    z-index: 2;

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

      &--empty {
        color: $color-text-secondary;
      }
    }

    #{$c}__arrow {
      fill: $color-text-tertiary;
      margin-inline-start: 5px;
      flex: 0 0 auto;
    }
  }

  #{$c}__options {
    max-height: 240px;
    padding-block: 5px;
    overflow-x: hidden;
    overflow-y: auto;
    position: absolute;
    inset-inline: 0;
    z-index: 1;

    #{$c}__option {
      display: block;
      line-height: 28px;

      a {
        background-color: transparent;
        display: flex;
        align-items: center;
        transition: none;

        #{$c}__value {
          color: $color-text-primary;
        }
      }

      &--hovered {
        a {
          background-color: $color-base-purple-normal;

          &,
          &:active {
            #{$c}__value {
              color: $color-text-reverse;
            }
          }

          &:active {
            background-color: darken($color-base-purple-normal, 6%);
          }
        }
      }

      &--selected {
        a {
          background-color: darken($color-background-secondary, 3%);
        }

        &#{$c}__option--hovered {
          a {
            background-color: darken($color-background-secondary, 8%);

            &,
            &:active {
              #{$c}__value {
                color: $color-text-primary;
              }
            }

            &:active {
              background-color: darken($color-background-secondary, 10%);
            }
          }
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

  // --> POSITIONS <--

  &--top {
    #{$c}__options {
      border-block-end: 0 none;
      inset-block-end: 100%;
      border-start-start-radius: $size-form-select-border-radius;
      border-start-end-radius: $size-form-select-border-radius;
    }

    &#{$c}--visible {
      #{$c}__field {
        border-start-start-radius: 0;
        border-start-end-radius: 0;
      }
    }
  }

  &--bottom {
    #{$c}__options {
      border-block-start: 0 none;
      inset-block-start: 100%;
      border-end-start-radius: $size-form-select-border-radius;
      border-end-end-radius: $size-form-select-border-radius;
    }

    &#{$c}--visible {
      #{$c}__field {
        border-end-start-radius: 0;
        border-end-end-radius: 0;
      }
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
