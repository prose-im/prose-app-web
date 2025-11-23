<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "c-layout-view",
    "c-layout-view--" + direction
  ]`
)
  component(
    v-bind="topbarProperties"
    :is="topbarComponent"
    class="c-layout-view__topbar"
  )

  .c-layout-view__content
    slot

  slot(
    name="modals"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "LayoutView",

  props: {
    topbarComponent: {
      type: Object,
      required: true
    },

    topbarProperties: {
      type: Object,

      default(): object {
        return {};
      }
    },

    direction: {
      type: String,
      default: "row",

      validator(x: string) {
        return ["row", "column"].includes(x);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-layout-view";

#{$c} {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  #{$c}__topbar {
    background-color: rgb(var(--color-background-tertiary));
    border-block-end: 1px solid rgb(var(--color-border-secondary));
    height: $size-layout-view-topbar-height;
    padding: 0 $size-layout-view-content-padding-sides;
    flex: 0 0 auto;
  }

  #{$c}__content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  // --> DIRECTIONS <--

  &--column {
    #{$c}__content {
      flex-direction: column;
    }
  }

  &--row {
    #{$c}__content {
      flex-direction: row;
    }
  }
}
</style>
