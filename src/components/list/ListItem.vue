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
      "c-list-item--active": active
    }
  ]`
)
  .c-list-item__icon(
    v-if="$slots.icon"
  )
    slot(
      name="icon"
    )

  .c-list-item__label
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
  height: 34px;
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
    margin-inline-end: 7px;
  }

  #{$c}__label {
    color: $color-text-primary;
    font-size: 14px;
  }

  #{$c}__count {
    margin-inline-start: 6px;
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
}
</style>
