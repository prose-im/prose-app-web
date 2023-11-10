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
  :important="unread > 0"
  :disabled="disabled"
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
    | {{ name }}

  template(
    v-if="unread > 0"
    v-slot:details
  )
    base-count(
      :count="unread"
      :color="countColor"
    )
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

    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    unread: {
      type: Number,
      default: 0
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
    },

    countColor(): string {
      return this.active === true ? "white" : "blue";
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onButtonClick(): void {
      this.$router.push({
        name: "app.inbox",
        params: { roomId: this.id }
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
