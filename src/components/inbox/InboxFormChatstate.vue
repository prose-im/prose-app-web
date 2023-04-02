<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "c-inbox-form-chatstate",
    "c-inbox-form-chatstate--" + chatstate
  ]`
)
  | Valerian

  base-space

  template(
    v-if="chatstate === 'paused'"
  )
    | stopped typing.

  template(
    v-else
  )
    | is typing…
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";

// PROJECT: BROKER
import { MessageChatState } from "@/broker/stanzas/message";

export default {
  name: "InboxFormChatstate",

  props: {
    chatstate: {
      type: String as PropType<MessageChatState>,
      default: MessageChatState.Inactive
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-form-chatstate";

.c-inbox-form-chatstate {
  background: rgba($color-white, 0.875);
  color: lighten($color-base-grey-dark, 15%);
  border: 1px solid darken($color-base-grey-light, 4%);
  font-size: 12.5px;
  line-height: 24px;
  opacity: 0;
  visibility: hidden;
  margin-block-end: -5px;
  padding-inline: 12px;
  padding-block-end: 1px;
  border-radius: 16px;
  box-shadow: 0 1px 3px 0 rgba($color-black, 0.02);
  backdrop-filter: blur(6px);

  // --> CHATSTATES <--

  &--composing,
  &--paused {
    opacity: 1;
    visibility: visible;
  }
}
</style>
