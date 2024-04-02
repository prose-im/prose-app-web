<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
sidebar-main-item-generic(
  :item="item"
  :translucent="translucent"
  :active="active"
  :class=`[
    "c-sidebar-main-item-multi",
    {
      "c-sidebar-main-item-multi--active": active
    }
  ]`
)
  template(
    v-if="icon"
    v-slot:icon
  )
    base-icon(
      :name="icon"
      size="13px"
      class="c-sidebar-main-item-multi__icon"
    )

  template(
    v-slot:default
  )
    | {{ item.name }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { SidebarItem, RoomType } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import SidebarMainItemGeneric from "@/components/sidebar/SidebarMainItemGeneric.vue";

export default {
  name: "SidebarMainItemMulti",

  components: { SidebarMainItemGeneric },

  props: {
    item: {
      type: Object as PropType<SidebarItem>,
      required: true
    },

    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    translucent: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    icon(): string | null {
      switch (this.type) {
        case "group": {
          return "at";
        }

        case "channel": {
          return this.item.room.type === RoomType.PrivateChannel
            ? "lock"
            : "circle.grid.2x2";
        }

        default: {
          return null;
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-main-item-multi";

#{$c} {
  #{$c}__icon {
    fill: rgb(var(--color-base-blue-dark));
    margin-block-start: 2px;
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__icon {
      fill: rgb(var(--color-white));
    }
  }
}
</style>
