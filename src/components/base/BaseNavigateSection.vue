<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
a.c-base-navigate-section
  span.c-base-navigate-section__icon

  span.c-base-navigate-section__text
    span.c-base-navigate-section__text-title.u-medium
      | {{ title }}

    span.c-base-navigate-section__text-label.u-medium
      | {{ label }}

  span.c-base-navigate-section__arrow
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseNavigateSection",

  props: {
    title: {
      type: String,
      required: true
    },

    label: {
      type: String,
      required: true
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-navigate-section";

.c-base-navigate-section {
  display: block;

  #{$c}__icon {
    /* TODO */
  }

  #{$c}__text {
    /* TODO */

    #{$c}__text-title {
      /* TODO */
    }

    #{$c}__text-label {
      /* TODO */
    }
  }

  #{$c}__arrow {
    /* TODO */
  }
}
</style>
