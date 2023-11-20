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
  :important="item.hasDraft || item.unreadCount > 0 || item.mentionsCount > 0"
  :class=`[
    "c-sidebar-main-item-generic",
    {
      "c-sidebar-main-item-generic--active": active
    }
  ]`
)
  template(
    v-if="$slots.icon"
    v-slot:icon
  )
    slot(
      name="icon"
    )

  template(
    v-slot:default
  )
    slot

  template(
    v-if="item.error || item.hasDraft || item.unreadCount > 0 || item.mentionsCount > 0"
    v-slot:details
  )
    base-tooltip(
      v-if="item.error"
      :tooltip="item.error"
      align="right"
    )
      base-icon(
        name="exclamationmark.triangle.fill"
        size="15px"
        class="c-sidebar-main-item-generic__error"
      )

    base-tooltip(
      v-if="item.hasDraft"
      align="right"
      tooltip="Draft Pending"
    )
      base-icon(
        name="pencil"
        size="12px"
        class="c-sidebar-main-item-generic__draft"
      )

    base-count(
      v-if="item.mentionsCount > 0"
      :color="countColor"
      icon="at"
    )

    base-count(
      v-else-if="item.unreadCount > 0"
      :count="item.unreadCount"
      :color="countColor"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { SidebarItem } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

export default {
  name: "SidebarMainItemGeneric",

  props: {
    item: {
      type: Object as PropType<SidebarItem>,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  emits: ["click"],

  computed: {
    countColor(): string {
      return this.active === true ? "white" : "blue";
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onButtonClick(): void {
      this.$emit("click");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-main-item-generic";

.c-sidebar-main-item-generic {
  #{$c}__draft {
    fill: rgb(var(--color-base-grey-dark));
  }

  #{$c}__error {
    fill: rgb(var(--color-base-orange-normal));
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__draft,
    #{$c}__error {
      fill: rgb(var(--color-white));
    }
  }
}
</style>
