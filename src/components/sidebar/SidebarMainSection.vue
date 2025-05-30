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
  :translucent="translucent"
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

  template(
    v-if="count > 0"
    v-slot:details
  )
    base-count(
      v-if="count > 0"
      :count="count"
      :color="countColor"
    )
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

    count: {
      type: Number,
      default: 0
    },

    translucent: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    countColor(): string {
      return this.active === true ? "white" : "red";
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-main-section";

#{$c} {
  #{$c}__icon {
    fill: rgb(var(--color-accent-background-dark));
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__icon {
      fill: rgb(var(--color-accent-text));
    }
  }
}
</style>
