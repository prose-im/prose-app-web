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
  .c-inbox-form-formatting__groups
    div(
      v-for="group in groups"
      :class=`[
        "c-inbox-form-formatting__group",
        {
          "c-inbox-form-formatting__group--reducible": group.reducible
        }
      ]`
    )
      base-tooltip(
        v-for="action in group.actions"
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

  .c-inbox-form-formatting__modes(
    v-if="modeToggle"
  )
    base-tooltip(
      :tooltip="modeToggle.title"
      align="right"
    )
      base-action(
        @click="onModeToggleClick"
        :icon="modeToggle.icon"
        :disabled="disabled"
        :class=`[
          "c-inbox-form-formatting__mode",
          "c-inbox-form-formatting__mode--" + mode
        ]`
        icon-class="c-inbox-form-formatting__mode-icon"
        context="transparent"
        size="12px"
        auto-width
        auto-height
        bordered
      )
        template(
          v-slot:inner
        )
          span(
            :class=`[
              "c-inbox-form-formatting__mode-label",
              {
                "u-medium": (mode === formattingModeOptions.Preview)
              }
            ]`
          )
            | {{ modeToggle.label }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";

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

export enum FormattingMode {
  // Write mode.
  Write = "write",
  // Preview mode.
  Preview = "preview"
}

// INTERFACES
export interface FormattingSyntax {
  code: string;
  contiguous?: boolean;
}

interface FormattingModeToggle {
  icon: string;
  label: string;
  title: string;
}

// CONSTANTS
export const TAG_INDEX = "%i";
export const TAG_TEXT = "%t";

export default {
  name: "InboxFormFormatting",

  props: {
    mode: {
      type: String as PropType<FormattingMode>,
      default: FormattingMode.Write
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ["action", "mode"],

  data() {
    return {
      // --> DATA <--

      formattingModeOptions: FormattingMode,

      groups: [
        {
          actions: [
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
          ]
        },

        {
          actions: [
            {
              title: "Link",
              icon: "link",
              action: FormattingAction.Link,

              syntax: {
                code: `[${TAG_TEXT}](${TAG_TEXT})`
              }
            }
          ],

          reducible: true
        },

        {
          actions: [
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

          reducible: true
        },

        {
          actions: [
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
        }
      ]
    };
  },

  computed: {
    modeToggle(): FormattingModeToggle | null {
      switch (this.mode) {
        case FormattingMode.Write: {
          return {
            icon: "character.cursor.ibeam",
            label: "Write",
            title: "Go to preview"
          };
        }

        case FormattingMode.Preview: {
          return {
            icon: "text.viewfinder",
            label: "Preview",
            title: "Return to editor"
          };
        }

        default: {
          return null;
        }
      }
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onActionClick(action: FormattingAction, syntax: FormattingSyntax): void {
      this.$emit("action", action, syntax);
    },

    onModeToggleClick(): void {
      // Find next mode (circle through modes)
      let nextMode: FormattingMode;

      switch (this.mode) {
        case FormattingMode.Write: {
          nextMode = FormattingMode.Preview;

          break;
        }

        case FormattingMode.Preview: {
          nextMode = FormattingMode.Write;

          break;
        }
      }

      // Update mode to next mode
      this.$emit("mode", nextMode);
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
  column-gap: 14px;

  &,
  #{$c}__groups,
  #{$c}__modes {
    display: flex;
    align-items: center;
  }

  #{$c}__group,
  #{$c}__modes {
    column-gap: 5px;
  }

  #{$c}__group {
    border-inline-end: 1px solid rgb(var(--color-border-tertiary));
    font-size: ($font-size-baseline - 1px);
    margin-inline-end: $group-spacing-edges;
    padding-inline-end: $group-spacing-edges;
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

  #{$c}__modes {
    flex: 1;
    justify-content: flex-end;

    #{$c}__mode {
      #{$c}__mode-icon {
        margin-inline-end: 5px;
      }

      #{$c}__mode-label {
        color: rgb(var(--color-text-primary));
        font-size: ($font-size-baseline - 2px);
        line-height: 12px;
      }

      &--preview {
        #{$c}__mode-icon {
          fill: rgb(var(--color-accent-background-dark));
        }

        #{$c}__mode-label {
          color: rgb(var(--color-accent-background-dark));
        }
      }
    }
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: $size-screen-reduced-width-breakpoint) {
  #{$c} {
    #{$c}__group {
      &--reducible {
        display: none;
      }
    }
  }
}
</style>
