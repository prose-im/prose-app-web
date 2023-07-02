<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-popup-actions
  base-button(
    @click="onCancel"
    tint="light"
    size="mid-medium"
    class="c-base-popup-actions__action"
  )
    | {{ cancelLabel }}

  base-button(
    @click="onConfirm"
    :tint="destructive ? 'red' : 'dark'"
    size="mid-medium"
    class="c-base-popup-actions__action"
  )
    | {{ confirmLabel }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BasePopupActions",

  props: {
    confirmLabel: {
      type: String,
      default: "Confirm"
    },

    cancelLabel: {
      type: String,
      default: "Cancel"
    },

    destructive: {
      type: Boolean,
      default: false
    }
  },

  emits: ["confirm", "cancel"],

  methods: {
    // --> EVENT LISTENERS <--

    onConfirm(): void {
      this.$emit("confirm");
    },

    onCancel(): void {
      this.$emit("cancel");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-popup-actions";

.c-base-popup-actions {
  display: flex;
  justify-content: flex-end;

  #{$c}__action {
    margin-inline: 3px;

    &:first-child {
      margin-inline-start: 0;
    }

    &:last-child {
      margin-inline-end: 0;
    }
  }
}
</style>
