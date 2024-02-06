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
  :disabled="disabled"
  class="c-sidebar-main-action-add"
  emphasis
)
  template(
    v-slot:icon
  )
    base-icon(
      name="plus.square.fill"
      size="13px"
      class="c-sidebar-main-action-add__icon"
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
  name: "SidebarMainActionAdd",

  props: {
    title: {
      type: String,
      required: true
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
$c: ".c-sidebar-main-action-add";

#{$c} {
  #{$c}__icon {
    fill: rgb(var(--color-base-blue-dark));
  }
}
</style>
