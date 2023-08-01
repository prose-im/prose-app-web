<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
transition(
  enter-active-class="animate animate--fade-in-up-small animate--fast"
  leave-active-class="animate animate--fade-out-down-small animate--superfast"
)
  .c-inbox-form-chatstate(
    v-if="isVisible"
  )
    | {{ rosterName }}

    base-space

    template(
      v-if="composing"
    )
      | is typing…
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@prose-im/prose-core-client-wasm";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "InboxFormChatstate",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    composing: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    isVisible(): boolean {
      return this.composing;
    },

    rosterName(): ReturnType<typeof Store.$roster.getEntryName> {
      return Store.$roster.getEntryName(this.jid);
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
  padding-inline: 12px;
  padding-block-end: 1px;
  border-radius: 16px;
  box-shadow: 0 1px 3px 0 rgba($color-black, 0.02);
  backdrop-filter: blur(6px);
}
</style>
