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
  :class=`[
    "c-sidebar-main-section",
    {
      "c-sidebar-main-section--active": active
    }
  ]`
)
  template(
    v-slot:icon
  )
    base-icon(
      :name="icon"
      size="16px"
      class="c-sidebar-main-section__icon"
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
  name: "SidebarMainSection",

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
$c: ".c-sidebar-main-section";

.c-sidebar-main-section {
  #{$c}__icon {
    fill: rgb(var(--color-base-blue-dark));
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__icon {
      fill: rgb(var(--color-white));
    }
  }
}
</style>
