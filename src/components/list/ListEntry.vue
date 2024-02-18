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
    "c-list-entry--color-" + color,
    {
      "c-list-entry--multi-line": multiLine
    }
  ]`
)
  .c-list-entry__icon(
    v-if="$slots.icon"
  )
    slot(
      name="icon"
    )

  div(
    :class=`[
      "c-list-entry__label",
      {
        "u-select": selectable,
        "u-ellipsis": !multiLine
      }
    ]`
  )
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
    },

    selectable: {
      type: Boolean,
      default: false
    },

    multiLine: {
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
$c: ".c-list-entry";

#{$c} {
  min-height: 30px;
  padding-inline: 12px;
  display: flex;
  align-items: center;

  #{$c}__icon {
    min-width: 18px;
    padding-inline-end: $size-list-item-icon-padding-inline-end;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #{$c}__label {
    font-size: 14px;
    line-height: 18px;
    flex: 1;
  }

  #{$c}__details {
    margin-inline-start: $size-list-item-details-margin-inline-start;
    display: flex;
    flex: 0 0 auto;
  }

  // --> COLORS <--

  &--color-normal {
    #{$c}__label {
      color: lighten-var(var(--color-text-primary), 26%);
    }
  }

  &--color-lighter {
    #{$c}__label {
      color: rgb(var(--color-text-secondary));
    }
  }

  // --> BOOLEANS <--

  &--multi-line {
    #{$c}__label {
      font-size: 13.5px;
      line-height: 16px;
      word-break: break-word;
      hyphens: auto;
      padding-block: 3px;
      overflow: hidden;
    }
  }
}
</style>
