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
      :emoji="status.icon"
      class="m-update-status__icon"
      icon="face.smiling"
      size="20px"
      dropdown
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

  .m-update-status__example(
    v-if="example.icon && example.text"
  )
    | For instance, you could update your status with

    base-space

    a.m-update-status__example-status(
      @click="onExampleStatusClick(example.icon, example.text)"
    )
      span.m-update-status__example-icon
        | {{ example.icon }}

      span.m-update-status__example-text.u-medium
        | {{ example.text }}

    | .
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import FormField from "@/components/form/FormField.vue";

// CONSTANTS
const EXAMPLE_STATUSES = [
  ["🥞", "Eating breakfast"],
  ["🌮", "Eating lunch"],
  ["🍽️", "Eating dinner"],
  ["🧑‍💻", "Focusing on code"],
  ["🏝️", "Vacationning"],
  ["🎉", "It's my birthday!"],
  ["🛏️", "Taking a nap"],
  ["📆", "In a meeting"],
  ["📞", "In a call"],
  ["☕️", "Drinking coffee"],
  ["🧉", "Drinking mate"],
  ["⛔️", "Important chats only"],
  ["🚴‍♂️", "Cycling"],
  ["🏃‍♂️", "Running"]
];

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

      example: {
        icon: "",
        text: ""
      },

      isIconPopoverVisible: false
    };
  },

  created() {
    // Pick a random example status
    this.pickRandomExampleStatus();
  },

  methods: {
    // --> HELPERS <--

    pickRandomExampleStatus() {
      const randomStatus =
        EXAMPLE_STATUSES[Math.floor(Math.random() * EXAMPLE_STATUSES.length)];

      // Assign random status
      this.example.icon = randomStatus[0];
      this.example.text = randomStatus[1];
    },

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

    onExampleStatusClick(icon: string, text: string): void {
      // Assign selected example status
      this.status.icon = icon;
      this.status.text = text;
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
      margin-inline-end: 10px;
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

  #{$c}__example {
    color: $color-text-secondary;
    font-size: 13px;
    margin-block-start: 15px;

    #{$c}__example-status {
      color: $color-text-primary;
      margin-inline-start: 4px;

      &:hover {
        #{$c}__example-text {
          text-decoration: underline;
        }
      }

      #{$c}__example-text {
        margin-inline-start: 3px;
      }
    }
  }
}
</style>
