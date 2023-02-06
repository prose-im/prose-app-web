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
    "c-list-entry",
    "c-list-entry--color-" + color
  ]`
)
  .c-list-entry__icon(
    v-if="$slots.icon"
  )
    slot(
      name="icon"
    )

  .c-list-entry__label
    slot

  .c-list-entry__details(
    v-if="$slots.details"
  )
    slot(
      name="details"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "ListEntry",

  props: {
    color: {
      type: String,
      default: "normal",

      validator(x: string) {
        return ["normal", "lighter"].includes(x);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-list-entry";

.c-list-entry {
  height: 30px;
  padding-inline: 12px;
  display: flex;
  align-items: center;

  #{$c}__icon {
    min-width: 22px;
    padding-inline-end: 7px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #{$c}__label {
    font-size: 14px;
    display: flex;
    align-items: center;
    flex: 1;
  }

  #{$c}__details {
    margin-inline-start: 6px;
    display: flex;
    flex: 0 0 auto;
  }

  // --> COLORS <--

  &--color-normal {
    #{$c}__label {
      color: lighten($color-text-primary, 26%);
    }
  }

  &--color-lighter {
    #{$c}__label {
      color: $color-text-secondary;
    }
  }
}
</style>
