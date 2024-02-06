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
  :static-texts="{ placeholder: 'Search for emojis'}"
  class="c-tool-emoji-picker"
  disable-skin-tones
  display-recent
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
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

#{$c} {
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

      .v3-search {
        /* Style inspired from FormField, since it cannot be injected there */

        input {
          background-color: rgb(var(--color-white));
          border: 1px solid rgba(var(--color-black), 0.1);
          outline: 0 solid rgba(var(--color-base-purple-normal), 0.2);
          color: rgb(var(--color-text-primary));
          font-size: 12px;
          height: 30px;
          padding: $size-form-field-padding-block
            $size-form-field-medium-padding-sides;
          transition: all 150ms linear;
          transition-property: border-color, outline-width;
          border-radius: $size-form-field-border-radius;
          box-sizing: border-box;
          box-shadow: inset 0 1px 2px 0 rgba(var(--color-black), 0.03);

          &:hover {
            border-color: rgba(var(--color-base-purple-normal), 0.5);
          }

          &:focus {
            border-color: rgb(var(--color-base-purple-normal));
            outline-width: $size-form-field-outline-width;
            box-shadow: inset 0 1px 2px 0 rgba(var(--color-black), 0.03);
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

// --> APPEARANCES <--

.u-appearance {
  &--dark {
    .v3-header {
      .v3-groups {
        .v3-group {
          .v3-icon {
            filter: invert(100%);
          }
        }
      }
    }
  }
}
</style>
