<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
emoji-picker(
  @select="onEmojiSelect"
  :native="true"
  class="c-tool-emoji-picker"
  disable-skin-tones
  hide-search
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
// @ts-expect-error EmojiPicker is a Vue component w/o any declaration
import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";

// INTERFACES
interface Emoji {
  i: string;
}

export default {
  name: "ToolEmojiPicker",

  components: { EmojiPicker },

  emits: ["pick"],

  methods: {
    // --> EVENT LISTENERS <--

    onEmojiSelect(emoji: Emoji): void {
      const emojiGlyph = emoji.i;

      this.$emit("pick", emojiGlyph);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-tool-emoji-picker";

.c-tool-emoji-picker {
  &.v3-emoji-picker {
    background: transparent;
    color: inherit;
    margin: 0;
    padding: 0;
    border-radius: 0;
    box-shadow: none;

    .v3-header,
    .v3-footer {
      border-color: rgb(var(--color-border-secondary));
    }

    .v3-header {
      padding-block-start: 3px;
      padding-block-end: 10px;

      .v3-groups {
        .v3-group {
          opacity: 0.65;

          &:hover,
          &:active {
            opacity: 1;
          }
        }
      }
    }

    .v3-body {
      padding-block-end: 0;

      .v3-body-inner {
        scroll-behavior: auto;
        scrollbar-color: initial;

        .v3-group {
          h5 {
            background: rgba(var(--color-white), 0.925);
            font-size: 13px;
            font-weight: $font-weight-medium;
            padding-block-start: 7px;
            padding-block-end: 8px;
            backdrop-filter: blur(8px);
          }

          .v3-emojis {
            button {
              border-radius: 7px;

              &:hover {
                background-color: rgb(var(--color-base-grey-light));
              }

              &:active {
                background-color: darken-var(
                  var(--color-base-grey-light),
                  1.5%
                );
              }
            }
          }
        }
      }
    }

    .v3-footer {
      line-height: 18px;
      padding-block-start: 8px;
      padding-block-end: 3px;

      .v3-foot-left {
        > .v3-text {
          font-size: 12.5px;
        }
      }
    }
  }
}
</style>
