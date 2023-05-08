<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
teleport(
  to="#app"
)
  div(
    v-hotkey="hotkeys"
    v-bind="$attrs"
    :class=`[
      "c-base-modal",
      "c-base-modal--" + size
    ]`
  )
    .c-base-modal__popup.animate.animate--superfast.animate--fade-in-up-small
      .c-base-modal__content
        slot

      .c-base-modal__actions
        base-button(
          @click="onClose"
          tint="light"
          size="mid-medium"
          class="c-base-modal__action"
        )
          | {{ closeLabel }}

        base-button(
          @click="onConfirm"
          :tint="destructive ? 'red' : 'dark'"
          size="mid-medium"
          class="c-base-modal__action"
        )
          | {{ confirmLabel }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseModal",

  props: {
    confirmLabel: {
      type: String,
      default: "Confirm"
    },

    closeLabel: {
      type: String,
      default: "Cancel"
    },

    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["medium", "large"].includes(x);
      }
    },

    destructive: {
      type: Boolean,
      default: false
    }
  },

  emits: ["confirm", "close"],

  computed: {
    hotkeys() {
      return {
        enter: this.onHotkeyEnter,
        esc: this.onHotkeyEscape
      };
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onConfirm(): void {
      this.$emit("confirm");
    },

    onClose(): void {
      this.$emit("close");
    },

    onHotkeyEnter(): void {
      // Confirm modal
      this.onConfirm();
    },

    onHotkeyEscape(): void {
      // Close modal
      this.onClose();
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-modal";

// VARIABLES
$popup-min-width-medium: 350px;
$popup-min-width-large: 440px;
$popup-max-width: 500px;
$popup-padding-sides: 25px;

.c-base-modal {
  background-color: rgba($color-base-grey-dark, 0.35);
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
  z-index: 1000;

  #{$c}__popup {
    background-color: $color-white;
    max-width: $popup-max-width;
    padding-inline: $popup-padding-sides;
    padding-block: 19px;
    border-radius: 7px;
    box-shadow: 0 4px 14px 0 rgba($color-black, 0.075);
  }

  #{$c}__content {
    font-size: 14.5px;
    line-height: 18px;

    > p {
      margin-block: 10px;

      &:first-child {
        margin-block-start: 0;
      }

      &:last-child {
        margin-block-end: 0;
      }
    }
  }

  #{$c}__actions {
    margin-block-start: 25px;
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

  // --> SIZES <--

  &--medium {
    #{$c}__popup {
      min-width: $popup-min-width-medium;
    }
  }

  &--large {
    #{$c}__popup {
      min-width: $popup-min-width-large;
    }
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: 540px) {
  .c-base-modal {
    #{$c}__popup {
      width: calc(100% - #{2 * $popup-padding-sides} - 14px);
      min-width: auto;
    }
  }
}
</style>
