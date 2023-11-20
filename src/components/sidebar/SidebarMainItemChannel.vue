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
  @click="onClick"
  :item="item"
  :active="active"
  :class=`[
    "c-sidebar-main-item-channel",
    {
      "c-sidebar-main-item-channel--active": active
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
      class="c-sidebar-main-item-channel__icon"
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
import { SidebarItem } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: COMPONENTS
import SidebarMainItemGeneric from "@/components/sidebar/SidebarMainItemGeneric.vue";

export default {
  name: "SidebarMainItemChannel",

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
          return "circle.grid.2x2";
        }

        default: {
          return null;
        }
      }
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onClick(): void {
      this.$router.push({
        name: "app.inbox",
        params: { roomId: this.item.room.id }
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

  // --> BOOLEANS <--

  &--active {
    #{$c}__icon {
      fill: rgb(var(--color-white));
    }
  }
}
</style>
