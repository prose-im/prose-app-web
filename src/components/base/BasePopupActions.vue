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
    :disabled="cancelDisabled"
    tint="light"
    size="mid-medium"
    class="c-base-popup-actions__action"
  )
    | {{ cancelLabel }}

  base-button(
    v-if="confirm"
    @click="onConfirm"
    :tint="destructive ? 'red' : 'dark'"
    :loading="confirmLoading"
    :disabled="confirmDisabled || confirmLoading"
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

    confirmLoading: {
      type: Boolean,
      default: false
    },

    confirmDisabled: {
      type: Boolean,
      default: false
    },

    cancelDisabled: {
      type: Boolean,
      default: false
    },

    confirm: {
      type: Boolean,
      default: true
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
      if (this.confirm === true) {
        this.$emit("confirm");
      }
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

#{$c} {
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
