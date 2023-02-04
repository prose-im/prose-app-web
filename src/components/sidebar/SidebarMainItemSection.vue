<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-item(
  :active="active"
  class="c-sidebar-main-item-section"
)
  template(
    v-slot:icon
  )
    base-icon(
      :name="icon"
      size="16px"
      class="c-sidebar-main-item-section__icon"
    )

  template(
    v-slot:default
  )
    | {{ title }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SidebarMainItemSection",

  props: {
    title: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      required: true
    },

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
$c: ".c-sidebar-main-item-section";

.c-sidebar-main-item-section {
  #{$c}__icon {
    fill: $color-base-blue-dark;
  }
}
</style>
