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
    "c-form-checkbox",
    "c-form-checkbox--" + size,
    {
      "c-form-checkbox--disabled": disabled,
      "c-form-checkbox--loading": loading
    }
  ]`
)
  input(
    @change="onInputChange"
    :name="name"
    :checked="modelValue"
    class="c-form-checkbox__input"
    type="checkbox"
  )

  label.c-form-checkbox__label(
    v-if="$slots.default"
    @click="onLabelClick"
    :class=[
      {
        "u-medium": hasLabelEmphasis,
        "u-regular": !hasLabelEmphasis
      }
    ]
  )
    slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "FormCheckbox",

  props: {
    modelValue: {
      type: Boolean,
      default: false
    },

    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["small", "medium"].includes(x);
      }
    },

    name: {
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

  emits: ["update:modelValue", "change"],

  computed: {
    hasLabelEmphasis(): boolean {
      return this.size === "medium" ? true : false;
    }
  },

  methods: {
    // --> HELPERS <--

    updateValue(checked: boolean): void {
      this.$emit("update:modelValue", checked);
      this.$emit("change", checked);
    },

    // --> EVENT LISTENERS <--

    onInputChange(event: Event): void {
      // Update model value?
      if (event.target) {
        this.updateValue((event.target as HTMLInputElement).checked);
      }
    },

    onLabelClick(): void {
      // Toggle model value
      this.updateValue(!this.modelValue);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-checkbox";

.c-form-checkbox {
  text-align: left;
  display: flex;
  align-items: center;

  #{$c}__input {
    border: 0 none;
    outline: 0;
    cursor: pointer;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    position: relative;
    appearance: none;

    &:before {
      content: "";
      background-color: rgb(var(--color-white));
      border: 1px solid rgb(var(--color-border-primary));
      outline: 2px solid transparent;
      position: absolute;
      inset: 0;
      box-sizing: border-box;
      border-radius: 6px;
      transition: border 150ms linear;
    }

    &:after {
      content: "";
      background-image: url("@/assets/images/components/form/FormCheckbox/check.svg");
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      width: 54%;
      aspect-ratio: 13/9;
      visibility: hidden;
      position: relative;
    }

    &:hover {
      &:checked {
        &:before {
          border-color: darken-var(var(--color-base-purple-normal), 5%);
          background: darken-var(var(--color-base-purple-normal), 5%);
        }
      }

      &:not(:checked) {
        &:before {
          border-color: rgba(var(--color-base-purple-normal), 0.75);
          border-width: 2px;
        }
      }
    }

    &:active {
      &:checked {
        &:before {
          border-color: darken-var(var(--color-base-purple-normal), 10%);
          background: darken-var(var(--color-base-purple-normal), 10%);
        }
      }

      &:not(:checked) {
        &:before {
          border-color: darken-var(var(--color-base-purple-normal), 8%);
        }
      }
    }

    &:focus-visible {
      &:before {
        outline-color: rgba(var(--color-base-purple-normal), 0.3);
        outline-offset: 1px;
      }
    }

    &:checked {
      &:before {
        border-color: rgb(var(--color-base-purple-normal));
        background: rgb(var(--color-base-purple-normal));
        transition: none;
      }

      &:after {
        border-color: rgb(var(--color-white));
        visibility: visible;
      }
    }
  }

  #{$c}__label {
    color: rgb(var(--color-text-primary));
    flex: 1;

    &:hover {
      cursor: pointer;
    }
  }

  // --> SIZES <--

  &--small {
    #{$c}__input {
      width: $size-form-checkbox-small-size;
      height: $size-form-checkbox-small-size;
    }

    #{$c}__label {
      font-size: 13px;
      padding-inline-start: 6px;
    }
  }

  &--medium {
    #{$c}__input {
      width: $size-form-checkbox-medium-size;
      height: $size-form-checkbox-medium-size;
    }

    #{$c}__label {
      font-size: 15px;
      padding-inline-start: 10px;
    }
  }

  // --> BOOLEANS <--

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }

    #{$c}__input,
    #{$c}__label {
      pointer-events: none;
    }

    #{$c}__input {
      &:before {
        opacity: 0.6;
      }
    }

    #{$c}__label {
      color: rgb(var(--color-text-secondary));
    }
  }
}
</style>
