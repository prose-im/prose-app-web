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
    "c-form-field--" + type,
    "c-form-field--" + size,
    "c-form-field--" + align,
    {
      "c-form-field--focused": isFocused,
      "c-form-field--disabled": disabled,
      "c-form-field--loading": loading
    }
  ]`
)
  textarea(
    v-if="type === 'textarea'"
    @keydown="onFieldKeyDown"
    @keyup="onFieldKeyUp"
    @input="onFieldInput"
    @focus="onFieldFocus"
    @blur="onFieldBlur"
    @contextmenu.stop
    :name="name"
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :class=`[
      "c-form-field__inner",
      "c-form-field__inner--textarea",
      {
        [fieldClass]: fieldClass
      }
    ]`
    rows="1"
    ref="field"
  )

  input(
    v-else
    @keydown="onFieldKeyDown"
    @keyup="onFieldKeyUp"
    @input="onFieldInput"
    @focus="onFieldFocus"
    @blur="onFieldBlur"
    @contextmenu.stop
    :type="type"
    :name="name"
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :class=`[
      "c-form-field__inner",
      "c-form-field__inner--input",
      {
        [fieldClass]: fieldClass
      }
    ]`
    ref="field"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { codes as keyCodes } from "keycode";

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

    align: {
      type: String,
      default: "center",

      validator(x: string) {
        return ["left", "center", "right"].includes(x);
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

    autogrow: {
      type: Boolean,
      default: false
    },

    submittable: {
      type: Boolean,
      default: false
    },

    autofocus: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    loading: {
      type: Boolean,
      default: false
    },

    fieldClass: {
      type: String,
      default: null
    }
  },

  emits: ["update:modelValue", "keystroke", "change", "submit"],

  data() {
    return {
      // --> STATE <--

      isFocused: false,

      value: ""
    };
  },

  watch: {
    modelValue: {
      immediate: true,

      handler(value) {
        this.value = value;

        // Refresh auto-grow (if enabled)
        this.$nextTick(this.refreshAutogrow);
      }
    }
  },

  mounted() {
    // Refresh auto-grow (if enabled)
    this.refreshAutogrow();

    // Apply auto-focus?
    if (this.autofocus === true) {
      this.focusField();
    }
  },

  methods: {
    // --> HELPERS <--

    focusField(): void {
      const fieldElement = (this.$refs.field as HTMLElement) || null;

      if (fieldElement !== null) {
        fieldElement.focus();
      }
    },

    refreshAutogrow(): void {
      if (this.autogrow === true) {
        const fieldElement = (this.$refs.field as HTMLElement) || null;

        if (fieldElement !== null) {
          // Reset height to default (so that later measured scroll height \
          //   reports its real value)
          fieldElement.style.height = "auto";

          // Assign new field height
          fieldElement.style.height = `${fieldElement.scrollHeight}px`;
        }
      }
    },

    // --> EVENT LISTENERS <--

    onFieldKeyDown(event: KeyboardEvent): void {
      // Submittable field? Handle key presses.
      if (this.submittable === true) {
        // Handle 'Enter' key press? (if not new line)
        if (event.keyCode === keyCodes.enter && event.shiftKey !== true) {
          event.preventDefault();

          // Trigger field submit event
          this.$emit("submit");
        }
      }
    },

    onFieldKeyUp(event: KeyboardEvent): void {
      // Propagate key event
      this.$emit("keystroke", event.target.value);
    },

    onFieldInput(): void {
      let inputValue: string | number =
        (this.$refs.field as HTMLInputElement).value || "";

      // Convert raw input value to number?
      if (inputValue && this.type === "number") {
        inputValue = Number(inputValue);
      }

      // Update model value and send change event
      this.$emit("update:modelValue", inputValue);
      this.$emit("change", inputValue);
    },

    onFieldFocus(): void {
      this.isFocused = true;
    },

    onFieldBlur(): void {
      this.isFocused = false;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-field";

.c-form-field {
  position: relative;

  &:before,
  #{$c}__inner {
    transition-duration: 150ms;
    transition-timing-function: linear;
  }

  &:before {
    content: "";
    border: $size-form-field-outline-width solid transparent;
    inset: (-1 * $size-form-field-outline-width);
    position: absolute;
    pointer-events: none;
    transition-property: border-color;
    border-radius: (
      $size-form-field-border-radius + $size-form-field-outline-width
    );
  }

  #{$c}__inner {
    background-color: rgb(var(--color-white));
    border: 1px solid rgba(var(--color-black), 0.1);
    outline: 0 none;
    color: rgb(var(--color-text-primary));
    font-family: inherit;
    width: 100%;
    padding-block: $size-form-field-padding-block;
    transition-property: box-shadow, border-color;
    border-radius: $size-form-field-border-radius;
    box-sizing: border-box;
    box-shadow: 0 3px 4px 0 rgba(var(--color-shadow-primary), 0.01),
      inset 0 1px 2px 0 rgba(var(--color-black), 0.04);

    &--textarea {
      height: 100%;
      margin: 0;
      resize: none;
      display: block;
    }

    &::placeholder {
      color: rgb(var(--color-text-secondary));
      opacity: 1;
    }

    &:hover {
      border-color: rgba(var(--color-base-purple-normal), 0.5);
    }

    &:focus {
      border-color: rgb(var(--color-base-purple-normal));
      box-shadow: 0 3px 4px 0 rgba(var(--color-shadow-primary), 0.1),
        inset 0 1px 2px 0 rgba(var(--color-black), 0.04);
    }
  }

  // --> TYPES <--

  &--input {
    display: inline-block;
  }

  &--textarea {
    display: block;
  }

  // --> SIZES <--

  &--medium {
    #{$c}__inner {
      font-size: 11px;
      padding-inline-start: $size-form-field-medium-padding-sides;
      padding-inline-end: $size-form-field-medium-padding-sides;

      &--input {
        line-height: $size-form-field-medium-input-line-height;
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
      padding-inline-start: $size-form-field-mid-medium-padding-sides;
      padding-inline-end: $size-form-field-mid-medium-padding-sides;

      &--input {
        line-height: $size-form-field-mid-medium-input-line-height;
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
      padding-inline-start: $size-form-field-large-padding-sides;
      padding-inline-end: $size-form-field-large-padding-sides;

      &--input {
        line-height: $size-form-field-large-input-line-height;
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
      padding-inline-start: $size-form-field-mid-large-padding-sides;
      padding-inline-end: $size-form-field-mid-large-padding-sides;

      &--input {
        line-height: $size-form-field-mid-large-input-line-height;
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
      padding-inline-start: $size-form-field-ultra-large-padding-sides;
      padding-inline-end: $size-form-field-ultra-large-padding-sides;

      &--input {
        line-height: $size-form-field-ultra-large-input-line-height;
      }

      &--textarea {
        line-height: 22px;
        padding-block: 13px;
      }
    }
  }

  // --> ALIGNS <--

  &--left {
    #{$c}__inner {
      text-align: left;
    }
  }

  &--center {
    #{$c}__inner {
      text-align: center;
    }
  }

  &--right {
    #{$c}__inner {
      text-align: right;
    }
  }

  // --> BOOLEANS <--

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }

    #{$c}__inner {
      background-color: rgba(var(--color-base-grey-light), 0.6);
      color: rgb(var(--color-text-secondary));
      pointer-events: none;

      &::placeholder {
        color: rgb(var(--color-text-tertiary));
      }
    }
  }

  &--focused {
    &:before {
      border-color: rgba(var(--color-base-purple-normal), 0.2);
    }
  }
}
</style>
