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
export default {
  name: "InboxFormFormatting",

  data() {
    return {
      // --> DATA <--

      groups: [
        {
          label: "Font",

          actions: [
            {
              title: "Bold",
              icon: "bold"
            },

            {
              title: "Icon",
              icon: "italic"
            },

            {
              title: "Underline",
              icon: "underline"
            },

            {
              title: "Strikethrough",
              icon: "strikethrough"
            }
          ]
        },

        {
          label: "Lists",

          actions: [
            {
              title: "List (Bullets)",
              icon: "list.bullet"
            },

            {
              title: "List (Numbers)",
              icon: "list.number"
            },

            {
              title: "Quote text",
              icon: "text.quote"
            }
          ]
        },

        {
          label: "Inserts",

          actions: [
            {
              title: "Link",
              icon: "link"
            },

            {
              title: "Code",
              icon: "chevron.left.forwardslash.chevron.right"
            },

            {
              title: "Image",
              icon: "character.textbox"
            }
          ]
        }
      ]
    };
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
