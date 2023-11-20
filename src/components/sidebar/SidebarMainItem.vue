<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
sidebar-main-item-user(
  v-if="item.room.type === roomType.DirectMessage"
  :jid="item.room.members[0]?.jid"
  :item="item"
  :active="active"
  class="c-sidebar-main-item"
)

sidebar-main-item-channel(
  v-else-if="item.room.type === roomType.Group"
  :item="item"
  :active="active"
  type="group"
  class="c-sidebar-main-item"
)

sidebar-main-item-channel(
  v-else-if="item.room.type === roomType.PublicChannel || item.room.type === roomType.PrivateChannel"
  :item="item"
  :active="active"
  type="channel"
  class="c-sidebar-main-item"
)

sidebar-main-item-generic(
  v-else
  :item="item"
  :active="active"
)
  | {{ item.name }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { RoomID, RoomType, SidebarItem } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import SidebarMainItemGeneric from "@/components/sidebar/SidebarMainItemGeneric.vue";
import SidebarMainItemChannel from "@/components/sidebar/SidebarMainItemChannel.vue";
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";

export default {
  name: "SidebarMainItem",

  components: {
    SidebarMainItemGeneric,
    SidebarMainItemChannel,
    SidebarMainItemUser
  },

  props: {
    item: {
      type: Object as PropType<SidebarItem>,
      required: true
    },

    selection: {
      type: String as PropType<RoomID>,
      default: null
    }
  },

  data() {
    return {
      // --> DATA <--

      roomType: RoomType
    };
  },

  computed: {
    active(): boolean {
      return this.item.room.id === this.selection;
    }
  }
};
</script>
