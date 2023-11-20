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
  :active="item.room.id === selection"
  class="c-sidebar-main-item"
)

sidebar-main-item-channel(
  v-else-if="item.room.type === roomType.Group"
  :item="item"
  :active="item.room.id === selection"
  type="group"
  class="c-sidebar-main-item"
)

sidebar-main-item-channel(
  v-else-if="item.room.type === roomType.PublicChannel || item.room.type === roomType.PrivateChannel"
  :item="item"
  :active="item.room.id === selection"
  type="channel"
  class="c-sidebar-main-item"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { RoomID, RoomType, SidebarItem } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import SidebarMainItemChannel from "@/components/sidebar/SidebarMainItemChannel.vue";
import SidebarMainItemUser from "@/components/sidebar/SidebarMainItemUser.vue";

export default {
  name: "SidebarMainItem",

  components: {
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
  }
};
</script>
