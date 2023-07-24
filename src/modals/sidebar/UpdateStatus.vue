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
  confirm-label="Edit Status"
  class="m-update-status"
  size="large"
)
  p.u-medium
    | Set a status for others to see:

  .m-update-status__fields
    base-action(
      @click="onIconClick"
      :active="isIconPopoverVisible"
      class="m-update-status__icon"
      icon="face.smiling"
      size="18px"
    )
      base-popover(
        v-if="isIconPopoverVisible"
        v-click-away="onIconPopoverClickAway"
        class="m-update-status__icon-popover"
      )
        tool-emoji-picker(
          @pick="onIconPick"
        )

    form-field(
      v-model="status.text"
      placeholder="What is your status?"
      type="text"
      name="status"
      size="large"
      align="left"
      ref="text"
      class="m-update-status__text"
      autofocus
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import FormField from "@/components/form/FormField.vue";

export default {
  name: "UpdateStatus",

  emits: ["close", "update"],

  data() {
    return {
      // --> STATE <--

      status: {
        icon: "",
        text: ""
      },

      isIconPopoverVisible: false
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onIconClick(): void {
      // Toggle popover
      this.isIconPopoverVisible = !this.isIconPopoverVisible;
    },

    onIconPopoverClickAway(): void {
      // Close popover
      this.isIconPopoverVisible = false;
    },

    onIconPick(glyph: string): void {
      // Assign selected icon
      this.status.icon = glyph;

      // Close emoji popover
      this.isIconPopoverVisible = false;

      // Focus on input
      (this.$refs.text as typeof FormField).focusField();
    },

    onConfirm(): void {
      if (!this.status.icon) {
        BaseAlert.warning("Icon required", "Pick an icon for your status");
      } else {
        this.$emit("update", this.status.icon, this.status.text || undefined);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-update-status";

.m-update-status {
  #{$c}__fields {
    display: flex;
    align-items: center;

    #{$c}__icon {
      margin-inline-end: 8px;
      flex: 0 0 auto;

      #{$c}__icon-popover {
        position: absolute;
        inset-inline-start: 0;
        inset-block-start: calc(
          100% + #{$size-base-popover-list-inset-block-edge-offset} + 3px
        );
        z-index: 1;
      }
    }

    #{$c}__text {
      flex: 1;
    }
  }
}
</style>
