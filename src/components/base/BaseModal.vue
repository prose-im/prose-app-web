<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-popup(
  @confirm="onConfirm"
  @close="onClose"
  :class=`[
    "c-base-modal",
    "c-base-modal--" + size,
    {
      "c-base-modal--constrained": constrained
    }
  ]`
  popup-class="c-base-modal__popup"
)
  div(
    :class=`[
      "c-base-modal__content",
      {
        "c-base-modal__content--loading": confirmLoading
      }
    ]`
  )
    slot

  base-popup-actions(
    @confirm="onConfirm"
    @cancel="onClose"
    :confirm-label="confirmLabel"
    :cancel-label="closeLabel"
    :confirm-loading="confirmLoading"
    :confirm-disabled="confirmDisabled"
    :destructive="destructive"
    class="c-base-modal__actions"
  )
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

    confirmLoading: {
      type: Boolean,
      default: false
    },

    confirmDisabled: {
      type: Boolean,
      default: false
    },

    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["medium", "large", "mid-large"].includes(x);
      }
    },

    constrained: {
      type: Boolean,
      default: false
    },

    destructive: {
      type: Boolean,
      default: false
    }
  },

  emits: ["confirm", "close"],

  methods: {
    // --> EVENT LISTENERS <--

    onConfirm(): void {
      if (this.confirmLoading !== true && this.confirmDisabled !== true) {
        this.$emit("confirm");
      }
    },

    onClose(): void {
      this.$emit("close");
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
$popup-min-width-mid-large: 560px;

$popup-max-width: $popup-min-width-mid-large;
$popup-max-width-toleration-sides: 20px;

$popup-padding-sides: 25px;

$popup-width-full-margin-sides: 14px;
$popup-width-full-breakpoint: (
  $popup-max-width + (2 * $popup-padding-sides) + $popup-width-full-margin-sides
);

#{$c} {
  #{$c}__popup {
    padding-inline: $popup-padding-sides;
    padding-block: 19px;
  }

  #{$c}__content {
    font-size: ($font-size-baseline + 0.5px);
    line-height: 18px;

    &--loading {
      cursor: wait;

      > * {
        pointer-events: none;
      }
    }

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
  }

  // --> SIZES <--

  &--medium {
    #{$c}__popup {
      min-width: $popup-min-width-medium;

      max-width: (
        $popup-min-width-medium + (2 * $popup-max-width-toleration-sides)
      );
    }

    &#{$c}--constrained {
      #{$c}__popup {
        max-width: $popup-min-width-medium;
      }
    }
  }

  &--large {
    #{$c}__popup {
      min-width: $popup-min-width-large;

      max-width: (
        $popup-min-width-large + (2 * $popup-max-width-toleration-sides)
      );
    }

    &#{$c}--constrained {
      #{$c}__popup {
        max-width: $popup-min-width-large;
      }
    }
  }

  &--mid-large {
    #{$c}__popup {
      min-width: $popup-min-width-mid-large;

      max-width: (
        $popup-min-width-mid-large + (2 * $popup-max-width-toleration-sides)
      );
    }

    &#{$c}--constrained {
      #{$c}__popup {
        max-width: $popup-min-width-mid-large;
      }
    }
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: $popup-width-full-breakpoint) {
  #{$c} {
    #{$c}__popup {
      width: calc(
        100% - #{2 * $popup-padding-sides} - #{$popup-width-full-margin-sides}
      );
      min-width: auto;
    }
  }
}
</style>
