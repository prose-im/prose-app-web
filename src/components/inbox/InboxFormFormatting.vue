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
      align="left"
    )
      base-action(
        @click="onActionClick(action.action)"
        :icon="action.icon"
        class="c-inbox-form-formatting__action"
        size="12px"
        auto-width
        auto-height
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
  // Underline formatting.
  Underline = "underline",
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

export default {
  name: "InboxFormFormatting",

  emits: ["action"],

  data() {
    return {
      // --> DATA <--

      groups: [
        [
          {
            title: "Bold",
            icon: "bold",
            action: FormattingAction.Bold
          },

          {
            title: "Italic",
            icon: "italic",
            action: FormattingAction.Italic
          },

          {
            title: "Underline",
            icon: "underline",
            action: FormattingAction.Underline
          },

          {
            title: "Strikethrough",
            icon: "strikethrough",
            action: FormattingAction.Strikethrough
          }
        ],

        [
          {
            title: "Link",
            icon: "link",
            action: FormattingAction.Link
          }
        ],

        [
          {
            title: "List (Bullets)",
            icon: "list.bullet",
            action: FormattingAction.ListBullets
          },

          {
            title: "List (Numbers)",
            icon: "list.number",
            action: FormattingAction.ListNumbers
          }
        ],

        [
          {
            title: "Code (Block)",
            icon: "chevron.left.forwardslash.chevron.right",
            action: FormattingAction.CodeBlock
          }
        ]
      ]
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onActionClick(action: FormattingAction): void {
      this.$emit("action", action);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-form-formatting";

#{$c} {
  display: flex;
  align-items: center;

  #{$c}__group {
    border-inline-end: 1px solid rgb(var(--color-border-tertiary));
    font-size: 13px;
    margin-inline-end: 8px;
    padding-inline-end: 10px;
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
