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
  @click="onButtonClick"
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
    id: {
      type: String,
      required: true
    },

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
  },

  methods: {
    // --> EVENT LISTENERS <--

    onButtonClick(): void {
      this.$router.push({
        name: "app.inbox",
        params: { roomID: this.id }
      });
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
    fill: rgb(var(--color-base-blue-dark));
    margin-block-start: 2px;
  }
}
</style>
