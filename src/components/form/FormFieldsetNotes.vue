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
    "c-form-fieldset-notes",
    {
      "c-form-fieldset-notes--spaced": spaced
    }
  ]`
)
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "FormFieldsetNotes",

  props: {
    spaced: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-form-fieldset-notes";

#{$c} {
  color: rgb(var(--color-text-secondary));
  font-size: ($font-size-baseline - 0.5px);
  line-height: 16px;

  p {
    margin-block-end: 11px;

    &:last-child {
      margin-block-end: 0;
    }
  }

  // --> BOOLEANS <--

  &--spaced {
    margin-block-start: 22px;
  }
}
</style>
