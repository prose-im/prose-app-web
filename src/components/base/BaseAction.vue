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
      "c-base-action--active": active,
      "c-base-action--disabled": disabled
    }
  ]`
)
  button.c-base-action__inner(
    @click="onInnerClick"
  )
    base-icon(
      :name="icon"
      :size="size"
      class="c-base-action__icon"
    )

    base-icon(
      v-if="dropdown"
      name="chevron.down"
      size="8px"
      class="c-base-action__dropdown"
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

    size: {
      type: String,
      default: "20px"
    },

    dropdown: {
      type: Boolean,
      default: false
    },

    active: {
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

.c-base-action {
  display: inline-block;

  #{$c}__inner {
    background-color: transparent;
    border: 0 none;
    outline: 2px solid transparent;
    user-select: none;
    width: 100%;
    margin: 0;
    padding: 0 8px;
    min-width: 36px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-sizing: border-box;
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

    #{$c}__icon,
    #{$c}__dropdown {
      fill: $color-base-grey-dark;
      flex: 0 0 auto;
    }

    #{$c}__dropdown {
      margin-left: 7px;
    }
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__inner {
      background-color: darken($color-base-grey-light, 3%);

      #{$c}__icon {
        fill: darken($color-base-blue-normal, 6%);
      }
    }
  }

  &--disabled {
    cursor: not-allowed;

    #{$c}__inner {
      pointer-events: none;
      opacity: 0.35;
    }
  }
}
</style>