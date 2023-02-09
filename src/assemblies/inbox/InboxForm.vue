<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-toolbar(
  class="a-inbox-form"
)
  template(
    v-slot:left
  )
    layout-actions
      base-action(
        @click="onActionFormattingClick"
        :active="isActionFormattingPopoverVisible"
        class="a-inbox-form__action"
        icon="textformat.alt"
        size="18px"
      )
        base-popover-list(
          v-if="isActionFormattingPopoverVisible"
          :items="actionFormattingPopoverItems"
          class="a-inbox-form__action-popover a-inbox-form__action-popover--left"
        )

  template(
    v-slot:middle
  )
    form.a-inbox-form__compose(
      @submit.prevent="onSubmit"
    )
      .a-inbox-form__compose-inner
        form-field(
          v-model="message"
          class="a-inbox-form__compose-field"
          type="textarea"
          name="message"
          placeholder="Message Valerian"
          size="large"
          autogrow
        )

        base-button(
          size="custom"
          type="submit"
          class="a-inbox-form__compose-send"
          button-class="a-inbox-form__compose-send-button"
          round
        )
          template(
            v-slot:custom
          )
            base-icon(
              name="paperplane.fill"
              size="18px"
              class="a-inbox-form__compose-send-icon"
            )

  template(
    v-slot:right
  )
    layout-actions
      base-action(
        class="a-inbox-form__action"
        icon="paperclip"
        size="18px"
      )

      base-action(
        @click="onActionEmojisClick"
        :active="isActionEmojisPopoverVisible"
        class="a-inbox-form__action"
        icon="face.smiling"
        size="18px"
      )
        base-popover-list(
          v-if="isActionEmojisPopoverVisible"
          :items="actionEmojisPopoverItems"
          class="a-inbox-form__action-popover a-inbox-form__action-popover--right"
        )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxForm",

  data() {
    return {
      // --> STATE <--

      message: "",

      isActionFormattingPopoverVisible: false,
      isActionEmojisPopoverVisible: false
    };
  },

  computed: {
    actionFormattingPopoverItems() {
      return [
        {
          type: "button",
          label: "Formatting items...",
          color: "blue"
        }
      ];
    },

    actionEmojisPopoverItems() {
      return [
        {
          type: "button",
          label: "Emoji picker...",
          color: "blue"
        }
      ];
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onActionFormattingClick() {
      // Toggle popover
      this.isActionFormattingPopoverVisible =
        !this.isActionFormattingPopoverVisible;
    },

    onActionEmojisClick() {
      // Toggle popover
      this.isActionEmojisPopoverVisible = !this.isActionEmojisPopoverVisible;
    },

    onSubmit(): void {
      // TODO
      console.error("send message: " + this.message);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-form";

// VARIABLES
$form-compose-padding-block: 10px;
$form-compose-field-height-minimum: (
  $size-inbox-form-height - (2 * $form-compose-padding-block)
);
$form-compose-field-border-radius: ceil(
  calc($form-compose-field-height-minimum / 2)
);

$form-compose-send-position-edges: 5px;
$form-compose-send-button-size: (
  $form-compose-field-height-minimum - (2 * $form-compose-send-position-edges)
);

.a-inbox-form {
  #{$c}__action {
    #{$c}__action-popover {
      position: absolute;
      inset-block-end: calc(
        100% + #{$size-base-popover-list-inset-block-edge-offset}
      );
      z-index: 1;

      &--left {
        inset-inline-start: 0;
      }

      &--right {
        inset-inline-end: 0;
      }
    }
  }

  #{$c}__compose {
    margin-inline: 12px;
    padding-block: $form-compose-padding-block;

    #{$c}__compose-inner {
      position: relative;
    }

    &,
    #{$c}__compose-field {
      width: 100%;
    }

    #{$c}__compose-field {
      &:before {
        border-radius: (
          $form-compose-field-border-radius + $size-form-field-outline-width
        );
      }

      textarea {
        min-height: $form-compose-field-height-minimum;
        max-height: 220px;
        padding-inline-end: (
          $form-compose-send-button-size + $form-compose-send-position-edges +
            2px
        );
        border-radius: $form-compose-field-border-radius;
      }
    }

    #{$c}__compose-send {
      position: absolute;
      inset-block-start: $form-compose-send-position-edges;
      inset-inline-end: $form-compose-send-position-edges;

      #{$c}__compose-send-button {
        width: $form-compose-send-button-size;
        height: $form-compose-send-button-size;
        display: flex;
        align-content: center;
        justify-content: center;
      }

      #{$c}__compose-send-icon {
        fill: $color-white;
        margin-inline-start: -2px;
      }
    }
  }
}
</style>
