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
  enter-active-class="u-animate u-animate--fade-in-up-small u-animate--fast"
  leave-active-class="u-animate u-animate--fade-out-down-small u-animate--superfast"
)
  .c-inbox-form-chatstate(
    v-if="isVisible"
  )
    | {{ typingNames }} {{ typingVerb }} typing…
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

// CONSTANTS
const TYPING_NAMES_SEVERAL_AFTER_SIZE = 3;

export default {
  name: "InboxFormChatstate",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    }
  },

  computed: {
    isVisible(): boolean {
      return this.states.composing.length > 0;
    },

    typingNames(): string {
      // Several people typing?
      if (this.states.composing.length > TYPING_NAMES_SEVERAL_AFTER_SIZE) {
        return "Several people";
      }

      // People names typing
      return this.states.composing
        .map(user => {
          return user.name;
        })
        .join(", ");
    },

    typingVerb(): string {
      return this.states.composing.length === 1 ? "is" : "are";
    },

    states(): ReturnType<typeof Store.$inbox.getStates> {
      return Store.$inbox.getStates(this.room.id);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-form-chatstate";

#{$c} {
  background: rgba(var(--color-white), 0.875);
  color: lighten-var(var(--color-base-grey-dark), 15%);
  border: 1px solid rgba(var(--color-border-primary), 0.8);
  font-size: 12.5px;
  line-height: 24px;
  padding-inline: 12px;
  padding-block-end: 1px;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(var(--color-shadow-primary), 0.02);
  backdrop-filter: blur(6px);
}
</style>
