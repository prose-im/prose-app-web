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
    "c-list-item",
    {
      "c-list-item--active": active,
      "c-list-item--important": important
    }
  ]`
)
  .c-list-item__icon
    slot(
      name="icon"
    )

  div(
    :class=`[
      "c-list-item__label",
      {
        "u-medium": emphasis,
        "u-bold": important
      }
    ]`
  )
    slot

  .c-list-item__count(
    v-if="$slots.count"
  )
    slot(
      name="count"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "ListItem",

  props: {
    active: {
      type: Boolean,
      default: false
    },

    emphasis: {
      type: Boolean,
      default: false
    },

    important: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-list-item";

.c-list-item {
  background-color: transparent;
  height: 32px;
  padding-inline: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: darken($color-base-grey-light, 1%);
  }

  &:active {
    background-color: darken($color-base-grey-light, 2%);
  }

  #{$c}__icon {
    min-width: 22px;
    padding-inline-end: 7px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #{$c}__label {
    color: $color-text-primary;
    font-size: 14px;
    display: flex;
    align-items: center;
    flex: 1;
  }

  #{$c}__count {
    margin-inline-start: 6px;
    flex: 0 0 auto;
  }

  // --> BOOLEANS <--

  &--active {
    background-color: $color-base-blue-normal;

    &:hover {
      background-color: darken($color-base-blue-normal, 4%);
    }

    &:active {
      background-color: darken($color-base-blue-normal, 6%);
    }

    #{$c}__label {
      color: $color-white;
    }
  }

  &--important {
    &:nth-child(odd) {
      background-color: darken($color-base-grey-light, 0.75%);
    }

    &:nth-child(even) {
      background-color: lighten($color-base-grey-light, 0.25%);
    }

    &:hover {
      background-color: darken($color-base-grey-light, 2.5%);
    }

    &:active {
      background-color: darken($color-base-grey-light, 3.5%);
    }
  }
}
</style>
