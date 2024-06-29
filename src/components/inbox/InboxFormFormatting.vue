<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-form-formatting
  .c-inbox-form-formatting__group(
    v-for="group in groups"
  )
    base-tooltip(
      v-for="action in group"
      :tooltip="action.title"
    )
      base-action(
        @click="onActionClick(action.action, action.syntax)"
        :icon="action.icon"
        :disabled="disabled"
        class="c-inbox-form-formatting__action"
        context="transparent"
        size="12px"
        auto-width
        auto-height
        bordered
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// ENUMERATIONS
export enum FormattingAction {
  // Bold formatting.
  Bold = "bold",
  // Italic formatting.
  Italic = "italic",
  // Strikethrough formatting.
  Strikethrough = "strikethrough",
  // Link formatting.
  Link = "link",
  // List bullets formatting.
  ListBullets = "list-bullets",
  // List numbers formatting.
  ListNumbers = "list-numbers",
  // Code block formatting.
  CodeBlock = "code-block"
}

// INTERFACES
export interface FormattingSyntax {
  code: string;
  contiguous?: boolean;
}

// CONSTANTS
export const TAG_INDEX = "%i";
export const TAG_TEXT = "%t";

export default {
  name: "InboxFormFormatting",

  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ["action"],

  data() {
    return {
      // --> DATA <--

      groups: [
        [
          {
            title: "Bold",
            icon: "bold",
            action: FormattingAction.Bold,

            syntax: {
              code: `**${TAG_TEXT}**`
            }
          },

          {
            title: "Italic",
            icon: "italic",
            action: FormattingAction.Italic,

            syntax: {
              code: `_${TAG_TEXT}_`
            }
          },

          {
            title: "Strikethrough",
            icon: "strikethrough",
            action: FormattingAction.Strikethrough,

            syntax: {
              code: `~~${TAG_TEXT}~~`
            }
          }
        ],

        [
          {
            title: "Link",
            icon: "link",
            action: FormattingAction.Link,

            syntax: {
              code: `[${TAG_TEXT}](${TAG_TEXT})`
            }
          }
        ],

        [
          {
            title: "List (Bullets)",
            icon: "list.bullet",
            action: FormattingAction.ListBullets,

            syntax: {
              code: `* ${TAG_TEXT}`
            }
          },

          {
            title: "List (Numbers)",
            icon: "list.number",
            action: FormattingAction.ListNumbers,

            syntax: {
              code: `${TAG_INDEX}. ${TAG_TEXT}`
            }
          }
        ],

        [
          {
            title: "Code (Block)",
            icon: "chevron.left.forwardslash.chevron.right",
            action: FormattingAction.CodeBlock,

            syntax: {
              code: `\`\`\`\n${TAG_TEXT}\n\`\`\``,
              contiguous: true
            }
          }
        ]
      ]
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onActionClick(action: FormattingAction, syntax: FormattingSyntax): void {
      this.$emit("action", action, syntax);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-form-formatting";

// VARIABLES
$group-spacing-edges: 12px;

#{$c} {
  display: flex;
  align-items: center;

  #{$c}__group {
    border-inline-end: 1px solid rgb(var(--color-border-tertiary));
    font-size: ($font-size-baseline - 1px);
    margin-inline-end: $group-spacing-edges;
    padding-inline-end: $group-spacing-edges;
    column-gap: 5px;
    display: flex;
    align-items: center;

    &:last-child {
      border-inline-end: 0 none;
      margin-inline-end: 0;
      padding-inline-end: 0;
    }

    &,
    #{$c}__action {
      flex: 0 0 auto;
    }

    #{$c}__action {
      margin-inline-end: 3px;

      &:last-child {
        margin-inline-end: 0;
      }
    }
  }
}
</style>
