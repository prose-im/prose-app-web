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
  class="c-sidebar-main-item-add"
  emphasis
)
  template(
    v-slot:icon
  )
    base-icon(
      name="plus.square.fill"
      size="13px"
      class="c-sidebar-main-item-add__icon"
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
  name: "SidebarMainItemAdd",

  props: {
    title: {
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
$c: ".c-sidebar-main-item-add";

.c-sidebar-main-item-add {
  #{$c}__icon {
    fill: $color-base-blue-dark;
  }
}
</style>
