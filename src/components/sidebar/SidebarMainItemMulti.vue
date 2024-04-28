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
  ellipsis
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
    span.c-sidebar-main-item-multi__name.u-ellipsis
      | {{ item.name }}

    span.c-sidebar-main-item-multi__domain.u-ellipsis(
      v-if="domainExternal"
    )
      | \#{{ domainExternal }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, SidebarItem, RoomType } from "@prose-im/prose-sdk-js";

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

    jid: {
      type: Object as PropType<JID>,
      required: true
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
      return this.$filters.string.roomTypeIntoIcon(this.item.room.type) || null;
    },

    domainExternal(): string | null {
      const roomType = this.item.room.type;

      // Only check if domain is external for channel rooms
      if (
        roomType === RoomType.PublicChannel ||
        roomType === RoomType.PrivateChannel
      ) {
        const roomDomain = this.item.room.id.split("@")[1] || null;

        if (
          roomDomain !== null &&
          roomDomain !== this.jid.domain &&
          roomDomain.endsWith(`.${this.jid.domain}`) === false
        ) {
          return roomDomain;
        }
      }

      return null;
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

  #{$c}__name {
    flex: 0 1 auto;
  }

  #{$c}__domain {
    color: rgb(var(--color-text-secondary));
    margin-inline-start: 4px;
    flex: 1;
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__icon {
      fill: rgb(var(--color-white));
    }

    #{$c}__domain {
      color: inherit;
    }
  }
}
</style>
