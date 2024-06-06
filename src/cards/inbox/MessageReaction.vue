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
  :origin="origin"
  class="c-message-reaction"
)
  .c-message-reaction__emoji
    | {{ reaction }}

  .c-message-reaction__details(
    v-if="authorNames.length > 0"
  )
    .c-message-reaction__label.u-medium
      | {{ authorNames.length }} reacted:

    .c-message-reaction__names
      template(
        v-for="(authorName, index) in authorNames"
      )
        template(
          v-if="index > 0"
        )
          | ,

          base-space

        | {{ authorName }}
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
  name: "MessageReaction",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    messageId: {
      type: String,
      required: true
    },

    reaction: {
      type: String,
      required: true
    },

    anchor: {
      type: Array<number>,
      required: true
    },

    origin: {
      type: Array<number>,
      default: null
    }
  },

  computed: {
    message(): InboxEntryMessage | void {
      return Store.$inbox.getMessage(this.room.id, this.messageId);
    },

    names(): ReturnType<typeof Store.$inbox.getNames> {
      return this.room ? Store.$inbox.getNames(this.room.id) : {};
    },

    authorJIDs(): Array<string> {
      let reaction = this.message?.reactions?.find(reaction => {
        return reaction.reaction === this.reaction;
      });

      return reaction?.authors || [];
    },

    authorNames(): Array<string> {
      return this.authorJIDs.map(authorJID => {
        return this.names[authorJID]?.name || authorJID;
      });
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-message-reaction";

#{$c} {
  max-width: 280px;
  display: flex;
  align-items: flex-start;

  #{$c}__emoji {
    font-size: 28px;
    margin-block: 9px;
    flex: 0 0 auto;
  }

  #{$c}__details {
    margin-inline-start: 12px;
    flex: 1;

    #{$c}__label {
      color: rgb(var(--color-text-secondary));
    }

    #{$c}__names {
      word-break: break-word;
      hyphens: auto;
      margin-block-start: 3px;
    }
  }
}
</style>
