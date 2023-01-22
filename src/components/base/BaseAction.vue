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
    "c-base-action",
    {
      "c-base-action--disabled": disabled
    }
  ]`
)
  button.c-base-action__inner(
    @click="onInnerClick"
  )
    base-icon(
      :name="icon"
      class="c-base-action__icon"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseAction",

  props: {
    icon: {
      type: String,
      required: true
    },

    dropdown: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ["click"],

  methods: {
    // --> EVENT LISTENERS <--

    onInnerClick(event: object): void {
      // Re-emit click event
      this.$emit("click", event);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-action";

// VARIABLES
$icon-size: 18px;

.c-base-action {
  display: inline-block;

  #{$c}__inner {
    background-color: transparent;
    border: 0 none;
    outline: 2px solid transparent;
    user-select: none;
    width: 100%;
    margin: 0;
    padding: 0;
    width: 36px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 100ms linear;

    &:hover {
      background-color: darken($color-base-grey-light, 4%);
    }

    &:active {
      background-color: darken($color-base-grey-light, 8%);
    }

    &:focus-visible {
      outline-color: rgba($color-base-purple-light, 0.3);
      outline-offset: 1px;
    }

    #{$c}__icon {
      fill: $color-base-grey-dark;
      width: $icon-size;
      height: $icon-size;
    }
  }

  // --> BOOLEANS <--

  &--dropdown {
    /* TODO */
  }

  &--disabled {
    cursor: not-allowed;

    #{$c}__inner {
      pointer-events: none;
      opacity: 0.6;
    }
  }
}
</style>
