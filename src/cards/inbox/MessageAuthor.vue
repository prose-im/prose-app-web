<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-card(
  :anchor="anchor"
  class="c-message-author"
)
  template(
    v-if="authorJID"
  )
    | {{ authorJID }}

  template(
    v-else
  )
    | Unknown sender
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { Room } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";
import { InboxEntryMessage } from "@/store/tables/inbox";

export default {
  name: "MessageAuthor",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    messageId: {
      type: String,
      required: true
    },

    anchor: {
      type: Array<number>,
      required: true
    }
  },

  computed: {
    message(): InboxEntryMessage | void {
      return Store.$inbox.getMessage(this.room.id, this.messageId);
    },

    authorJID(): string | void {
      return this.message?.from;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-message-author";

#{$c} {
  max-width: 340px;
}
</style>
