<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-button(
  :active="active"
  :disabled="disabled"
  class="c-sidebar-main-item-channel"
)
  template(
    v-slot:icon
  )
    base-icon(
      name="circle.grid.2x2"
      size="13px"
      class="c-sidebar-main-item-channel__icon"
    )

  template(
    v-slot:default
  )
    | {{ name }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SidebarMainItemChannel",

  props: {
    name: {
      type: String,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    },

    disabled: {
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
$c: ".c-sidebar-main-item-channel";

.c-sidebar-main-item-channel {
  #{$c}__icon {
    fill: $color-base-blue-dark;
    margin-block-start: 2px;
  }
}
</style>
