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
  size="large"
)
  p.u-medium
    | Edit message:

  form-field(
    v-model="editedText"
    placeholder="Enter edited message…"
    class="m-edit-message__field"
    type="textarea"
    name="message"
    size="large"
    field-class="m-edit-message__field-textarea"
    autofocus
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

    onConfirm(): void {
      if (this.editedText) {
        if (this.editedText !== this.originalText) {
          // Messages are different, therefore consider as edition
          this.$emit("edit", this.context, this.editedText);
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

.m-edit-message {
  #{$c}__field {
    #{$c}__field-textarea {
      min-height: 100px;
    }
  }
}
</style>
