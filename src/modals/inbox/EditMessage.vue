<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-modal(
  @close="$emit('close')"
  @confirm="onConfirm"
  confirm-label="Edit Message"
  class="m-edit-message"
  size="mid-large"
)
  p.u-medium
    | Edit message:

  form-field(
    v-model="editedText"
    @keystroke="onFieldKeyStroke"
    @submit="onConfirm"
    :rows="8"
    placeholder="Enter edited message…"
    class="m-edit-message__field"
    type="textarea"
    name="message"
    size="large"
    align="left"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="none"
    spellcheck="false"
    field-class="m-edit-message__field-textarea"
    submittable
    autofocus
    autogrow
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "EditMessage",

  props: {
    context: {
      type: Object,
      required: true
    },

    originalText: {
      type: String,
      required: true
    }
  },

  emits: ["close", "edit"],

  data() {
    return {
      // --> STATE <--

      editedText: ""
    };
  },

  created() {
    // Assign initial model value
    this.editedText = this.originalText;
  },

  methods: {
    // --> EVENT LISTENERS <--

    onFieldKeyStroke(value: string): void {
      // Check for emoji replacements
      const emojiTextValue =
        this.$filters.string.replaceLastSmileyToEmoji(value);

      if (emojiTextValue !== null) {
        // Update model
        this.editedText = emojiTextValue;
      }
    },

    onConfirm(): void {
      // Handle virtual key stroke (adding a space at the end of the \
      //   message, so that the last smiley gets replaced, if any)
      // Notice: the extra space will be trimmed after that.
      this.onFieldKeyStroke(this.editedText + " ");

      // Process edited text
      const editedText = this.editedText.trim();

      if (editedText) {
        if (editedText !== this.originalText) {
          // Messages are different, therefore consider as edition
          this.$emit("edit", this.context, editedText);
        } else {
          // Messages are the same, therefore consider as close
          this.$emit("close");
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-edit-message";

#{$c} {
  #{$c}__field {
    #{$c}__field-textarea {
      max-height: 320px;
    }
  }
}
</style>
