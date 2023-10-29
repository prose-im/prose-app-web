<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.a-inbox-details
  template(
    v-if="room"
  )
    inbox-details-user(
      v-if="room.type === roomType.DirectMessage"
      :room="room"
      :jid="jid"
      header-class="a-inbox-details__header"
      item-class="a-inbox-details__item"
    )

    inbox-details-group(
      v-else-if="room.type === roomType.Group"
      :room="room"
      header-class="a-inbox-details__header"
      item-class="a-inbox-details__item"
    )

    inbox-details-channel(
      v-else-if="room.type === roomType.PrivateChannel || room.type === roomType.PublicChannel"
      :room="room"
      header-class="a-inbox-details__header"
      item-class="a-inbox-details__item"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, Room, RoomType } from "@prose-im/prose-sdk-js";

// PROJECT: ASSEMBLIES
import InboxDetailsUser from "@/assemblies/inbox/InboxDetailsUser.vue";
import InboxDetailsGroup from "@/assemblies/inbox/InboxDetailsGroup.vue";
import InboxDetailsChannel from "@/assemblies/inbox/InboxDetailsChannel.vue";

export default {
  name: "InboxDetails",

  components: {
    InboxDetailsUser,
    InboxDetailsGroup,
    InboxDetailsChannel
  },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    room: {
      type: Object as PropType<Room>,
      default: undefined
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

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-details";

.a-inbox-details {
  padding: 20px 0;
  overflow-x: hidden;
  overflow-y: auto;

  #{$c}__header,
  #{$c}__item {
    padding-inline: $size-inbox-details-item-padding-sides;
  }
}
</style>
