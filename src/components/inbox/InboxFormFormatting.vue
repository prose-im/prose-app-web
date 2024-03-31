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

export enum FormattingSyntaxMode {
  // Prepend syntax mode.
  Prepend = "prepend",
  // Enclose syntax mode.
  Enclose = "enclose"
}

// INTERFACES
export interface FormattingSyntax {
  mode: FormattingSyntaxMode;
  code: string;
}

// CONSTANTS
export const REPLACEMENT_TAG = "%s";

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
              mode: FormattingSyntaxMode.Enclose,
              code: `**${REPLACEMENT_TAG}**`
            }
          },

          {
            title: "Italic",
            icon: "italic",
            action: FormattingAction.Italic,

            syntax: {
              mode: FormattingSyntaxMode.Enclose,
              code: `_${REPLACEMENT_TAG}_`
            }
          },

          {
            title: "Strikethrough",
            icon: "strikethrough",
            action: FormattingAction.Strikethrough,

            syntax: {
              mode: FormattingSyntaxMode.Enclose,
              code: `~~${REPLACEMENT_TAG}~~`
            }
          }
        ],

        [
          {
            title: "Link",
            icon: "link",
            action: FormattingAction.Link,

            syntax: {
              mode: FormattingSyntaxMode.Enclose,
              code: `[](${REPLACEMENT_TAG})`
            }
          }
        ],

        [
          {
            title: "List (Bullets)",
            icon: "list.bullet",
            action: FormattingAction.ListBullets,

            syntax: {
              mode: FormattingSyntaxMode.Enclose,
              code: `* ${REPLACEMENT_TAG}`
            }
          },

          {
            title: "List (Numbers)",
            icon: "list.number",
            action: FormattingAction.ListNumbers,

            syntax: {
              mode: FormattingSyntaxMode.Enclose,
              code: `1. ${REPLACEMENT_TAG}`
            }
          }
        ],

        [
          {
            title: "Code (Block)",
            icon: "chevron.left.forwardslash.chevron.right",
            action: FormattingAction.CodeBlock,

            syntax: {
              mode: FormattingSyntaxMode.Enclose,
              code: `\`\`\`\n${REPLACEMENT_TAG}\n\`\`\``
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
    font-size: 13px;
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
