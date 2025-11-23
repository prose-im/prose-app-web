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
    "c-form-toggle",
    {
      "c-form-toggle--disabled": disabled,
      "c-form-toggle--loading": loading
    }
  ]`
)
  input(
    @change="onInputChange"
    :name="name"
    :checked="checked"
    class="c-form-toggle__input"
    type="checkbox"
    ref="input"
  )

  a.c-form-toggle__field(
    @click="onFieldClick"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "FormToggle",

  props: {
    modelValue: {
      type: Boolean,
      default: false
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

  data() {
    return {
      // --> STATE <--

      checked: false
    };
  },

  watch: {
    modelValue: {
      immediate: true,

      handler(value) {
        this.checked = value;
      }
    }
  },

  methods: {
    updateValue(enabled: boolean): void {
      this.$emit("update:modelValue", enabled);
      this.$emit("change", enabled);
    },

    // --> EVENT LISTENERS <--

    onInputChange(event: Event): void {
      // Update model value?
      if (event.target) {
        this.updateValue((event.target as HTMLInputElement).checked);
      }
    },

    onFieldClick(): void {
      // Toggle hidden input value
      (this.$refs.input as HTMLInputElement).click();
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-toggle";

// VARIABLES
$toggle-width: 38px;
$toggle-height: 22px;

$toggle-handle-offset: 2px;
$toggle-handle-size: ($toggle-height - (2 * $toggle-handle-offset));

$toggle-field-width: ($toggle-width - (2 * $toggle-handle-offset));
$toggle-field-height: ($toggle-height - (2 * $toggle-handle-offset));

#{$c} {
  display: inline-block;

  #{$c}__input {
    display: none;

    &:checked + #{$c}__field {
      background-color: rgb(var(--color-base-purple-normal));

      &:after {
        background-color: rgb(var(--color-white-fixed));
        margin-inline-start: ($toggle-field-width - $toggle-handle-size);
      }

      &:hover {
        background-color: darken-var(var(--color-base-purple-normal), 8%);
      }

      &:active {
        background-color: darken-var(var(--color-base-purple-normal), 14%);
      }
    }
  }

  #{$c}__field {
    background-color: rgba(var(--color-base-grey-normal), 0.2);
    width: $toggle-field-width;
    height: $toggle-field-height;
    padding: $toggle-handle-offset;
    display: block;
    position: relative;
    border-radius: $toggle-height;
    transition: background-color 100ms linear;

    &:after {
      content: "";
      background-color: rgb(var(--color-background-quaternary));
      width: $toggle-handle-size;
      height: $toggle-handle-size;
      border-radius: $toggle-height;
      display: block;
      box-shadow: 0 1px 2px 0 rgba(var(--color-shadow-primary), 0.08);
      transition: all 150ms linear;
      transition-property: margin-inline-start, box-shadow;
    }

    &:hover {
      background-color: rgba(var(--color-base-grey-normal), 0.27);

      &:after {
        box-shadow: 0 1px 2px 0 rgba(var(--color-shadow-primary), 0.12);
      }
    }

    &:active {
      background-color: rgba(var(--color-base-grey-normal), 0.34);

      &:after {
        box-shadow: 0 1px 2px 0 rgba(var(--color-shadow-primary), 0.1);
      }
    }
  }

  // --> BOOLEANS <--

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }

    #{$c}__field {
      pointer-events: none;
    }
  }
}
</style>
