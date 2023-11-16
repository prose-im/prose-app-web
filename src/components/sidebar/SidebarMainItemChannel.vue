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
  :important="draft || unread > 0 || mentions > 0"
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
    v-if="error || draft || unread > 0 || mentions > 0"
    v-slot:details
  )
    base-tooltip(
      v-if="error"
      :tooltip="error"
      align="right"
    )
      base-icon(
        name="exclamationmark.triangle.fill"
        size="15px"
        class="c-sidebar-main-item-channel__error"
      )

    base-tooltip(
      v-if="draft"
      align="right"
      tooltip="Draft Pending"
    )
      base-icon(
        name="pencil"
        size="12px"
        class="c-sidebar-main-item-channel__draft"
      )

    base-count(
      v-if="mentions > 0"
      :color="countColor"
      icon="at"
    )

    base-count(
      v-else-if="unread > 0"
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

    mentions: {
      type: Number,
      default: 0
    },

    error: {
      type: String,
      default: null
    },

    draft: {
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

  #{$c}__draft {
    fill: rgb(var(--color-base-grey-dark));
  }

  #{$c}__error {
    fill: rgb(var(--color-base-orange-normal));
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__icon {
      fill: rgb(var(--color-white));
    }

    #{$c}__draft,
    #{$c}__error {
      fill: rgb(var(--color-white));
    }
  }
}
</style>
