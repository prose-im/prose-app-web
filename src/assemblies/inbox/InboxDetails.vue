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
      @file-preview="onFilePreview"
      :room="room"
      :jid="jid"
      header-class="a-inbox-details__header"
      item-class="a-inbox-details__item"
      button-class="a-inbox-details__button"
    )

    inbox-details-group(
      v-else-if="room.type === roomType.Group"
      @file-preview="onFilePreview"
      :room="room"
      header-class="a-inbox-details__header"
      item-class="a-inbox-details__item"
      button-class="a-inbox-details__button"
    )

    inbox-details-channel(
      v-else-if="room.type === roomType.PrivateChannel || room.type === roomType.PublicChannel"
      @file-preview="onFilePreview"
      :room="room"
      header-class="a-inbox-details__header"
      item-class="a-inbox-details__item"
      button-class="a-inbox-details__button"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, Room, RoomType } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import { Collection as FilePreviewCollection } from "@/components/inbox/InboxFilePreview.vue";

// PROJECT: ASSEMBLIES
import InboxDetailsUser from "@/assemblies/inbox/InboxDetailsUser.vue";
import InboxDetailsGroup from "@/assemblies/inbox/InboxDetailsGroup.vue";
import InboxDetailsChannel from "@/assemblies/inbox/InboxDetailsChannel.vue";

// PROJECT: STORES
import Store from "@/store";

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

  emits: ["filePreview"],

  data() {
    return {
      // --> DATA <--

      roomType: RoomType
    };
  },

  mounted() {
    // Mark inbox details as mounted
    Store.$session.setInterfaceInboxDetailsMounted(true);
  },

  unmounted() {
    // Mark inbox details as unmounted
    Store.$session.setInterfaceInboxDetailsMounted(false);
  },

  methods: {
    // --> EVENT LISTENERS <--

    onFilePreview(collection: FilePreviewCollection, index = 0): void {
      this.$emit("filePreview", collection, index);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-details";

#{$c} {
  padding: 20px 0;
  overflow-x: hidden;
  overflow-y: auto;

  #{$c}__header,
  #{$c}__item {
    padding-inline: $size-inbox-details-item-padding-sides;
  }

  #{$c}__button {
    padding-inline: (
      $size-inbox-details-item-padding-sides -
        $size-list-button-rounded-margin-inline
    );
  }
}
</style>
