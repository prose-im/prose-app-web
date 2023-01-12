<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-form-checkbox
  input(
    @change="onInputChange"
    :name="name"
    :checked="modelValue"
    :disabled="disabled"
    class="c-form-checkbox__input"
    type="checkbox"
  )

  label.c-form-checkbox__label.u-medium(
    v-if="$slots.default"
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
    name: {
      type: String,
      default: null
    }
  },

  emits: ["update:modelValue"],

  methods: {
    // --> EVENT LISTENERS <--

    /**
     * Triggers on input change
     * @public
     * @param  {object} event
     * @return {undefined}
     */
    onInputChange(event) {
      // Update model value
      this.$emit("update:modelValue", event.target.checked);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss" scoped>
$c: ".c-form-checkbox";

// VARIABLES
$checkbox-size: 24px;

.c-form-checkbox {
  text-align: left;
  display: flex;
  align-items: center;

  #{$c}__input {
    border: 0 none;
    width: $checkbox-size;
    height: $checkbox-size;
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
      background-color: $color-white;
      border: 1px solid $color-border-primary;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      box-sizing: border-box;
      border-radius: 6px;
      transition: border linear 150ms;
    }

    &:after {
      content: "";
      background-image: url("/src/assets/images/components/form/FormCheckbox/check.svg");
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      width: 13px;
      height: 9px;
      visibility: hidden;
      position: relative;
    }

    &:hover {
      &:checked {
        &:before {
          border-color: darken($color-base-purple-normal, 5%);
          background: darken($color-base-purple-normal, 5%);
        }
      }

      &:not(:checked) {
        &:before {
          border-color: rgba($color-base-purple-normal, 0.75);
          border-width: 2px;
        }
      }
    }

    &:active {
      &:checked {
        &:before {
          border-color: darken($color-base-purple-normal, 10%);
          background: darken($color-base-purple-normal, 10%);
        }
      }

      &:not(:checked) {
        &:before {
          border-color: darken($color-base-purple-normal, 8%);
        }
      }
    }

    &:checked {
      &:before {
        border-color: $color-base-purple-normal;
        background: $color-base-purple-normal;
        transition: none;
      }

      &:after {
        border-color: $color-white;
        visibility: visible;
      }
    }
  }

  #{$c}__label {
    color: $color-black;
    font-size: 15px;
    margin-left: 10px;
    flex: 1;
  }
}
</style>
