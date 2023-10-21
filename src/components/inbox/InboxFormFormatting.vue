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
    .c-inbox-form-formatting__label
      | {{ group.label }}

    .c-inbox-form-formatting__actions
      base-tooltip(
        v-for="action in group.actions"
        align="left"
      )
        template(
          v-slot:tooltip
        )
          | {{ action.title }}

        template(
          v-slot:default
        )
          base-action(
            @click="onActionClick(action.action)"
            :icon="action.icon"
            class="c-inbox-form-formatting__action"
            size="14px"
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
  // List bullets formatting.
  ListBullets = "list-bullets",
  // List numbers formatting.
  ListNumbers = "list-numbers",
  // Quote formatting.
  Quote = "quote",
  // Link formatting.
  Link = "link",
  // Code formatting.
  Code = "code",
  // Snippet formatting.
  Snippet = "snippet"
}

export default {
  name: "InboxFormFormatting",

  emits: ["action"],

  data() {
    return {
      // --> DATA <--

      groups: [
        {
          label: "Font",

          actions: [
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
          ]
        },

        {
          label: "Lists",

          actions: [
            {
              title: "List (Bullets)",
              icon: "list.bullet",
              action: FormattingAction.ListBullets
            },

            {
              title: "List (Numbers)",
              icon: "list.number",
              action: FormattingAction.ListNumbers
            },

            {
              title: "Quote text",
              icon: "text.quote",
              action: FormattingAction.Quote
            }
          ]
        },

        {
          label: "Inserts",

          actions: [
            {
              title: "Link",
              icon: "link",
              action: FormattingAction.Link
            },

            {
              title: "Code",
              icon: "chevron.left.forwardslash.chevron.right",
              action: FormattingAction.Code
            },

            {
              title: "Snippet",
              icon: "character.textbox",
              action: FormattingAction.Snippet
            }
          ]
        }
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

.c-inbox-form-formatting {
  #{$c}__group {
    border-block-end: 1px solid rgb(var(--color-border-tertiary));
    font-size: 13px;
    margin-block-end: 8px;
    padding-block-end: 10px;
    display: flex;
    align-items: center;

    &:last-child {
      border-block-end: 0 none;
      margin-block-end: 0;
      padding-block-end: 0;
    }

    #{$c}__label {
      color: rgb(var(--color-text-primary));
      min-width: 54px;
      padding-inline-end: 4px;
      flex: 0 0 auto;
    }

    #{$c}__actions {
      flex: 1;

      #{$c}__action {
        margin-inline-end: 3px;

        &:last-child {
          margin-inline-end: 0;
        }
      }
    }
  }
}
</style>
