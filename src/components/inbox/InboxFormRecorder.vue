<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-form-recorder
  span.c-inbox-form-recorder__timer.u-medium.u-animate.u-animate--infinite.u-animate--superslow.u-animate--delayed.u-animate--blink
    | 0:00

  .c-inbox-form-recorder__actions(
    v-if="actions.length > 0"
  )
    base-tooltip(
      v-for="action in actions"
      :key="action.id"
      :tooltip="action.tooltip"
    )
      base-button(
        @click="action.click"
        :class=`[
          "c-inbox-form-recorder__action",
          "c-inbox-form-recorder__action--" + action.id
        ]`
        tint="light"
        size="custom"
        button-class="c-inbox-form-recorder__action-button"
        round
      )
        template(
          v-slot:custom
        )
          base-icon(
            :name="action.icon.name"
            :size="action.icon.size"
            class="c-inbox-form-recorder__action-icon"
          )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxFormRecorder",

  emits: ["audio", "cancel"],

  data() {
    return {
      // --> DATA <--

      actions: [
        {
          id: "cancel",
          tooltip: "Cancel Recording",
          click: this.onCancelClick,

          icon: {
            name: "xmark",
            size: "8px"
          }
        },

        {
          id: "send",
          tooltip: "Send Audio",
          click: this.onSendClick,

          icon: {
            name: "arrow.right",
            size: "11px"
          }
        }
      ]
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onSendClick(): void {
      // TODO: fill this up
      this.$emit("audio", null);
    },

    onCancelClick(): void {
      this.$emit("cancel");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-form-recorder";

// VARIABLES
$recorder-cancel-button-size: 20px;
$recorder-send-button-size: 24px;

.c-inbox-form-recorder {
  background-color: rgb(var(--color-base-green-normal));
  color: rgb(var(--color-text-reverse));
  padding: 0 6px;
  display: flex;
  align-items: center;
  border-radius: 16px;

  #{$c}__timer {
    font-size: 12.5px;
    margin-inline-start: 4px;
  }

  #{$c}__actions {
    margin-inline-start: 7px;
    display: flex;
    align-items: center;

    > * {
      margin-inline-end: 3px;
      flex: 0 0 auto;

      &:last-child {
        margin-inline-end: 0;
      }
    }
  }

  #{$c}__action {
    #{$c}__action-button {
      display: flex;
      align-content: center;
      justify-content: center;
    }

    &--cancel {
      #{$c}__action-button {
        width: $recorder-cancel-button-size;
        height: $recorder-cancel-button-size;
      }

      #{$c}__action-icon {
        fill: rgb(var(--color-base-red-normal));
      }
    }

    &--send {
      #{$c}__action-button {
        width: $recorder-send-button-size;
        height: $recorder-send-button-size;
      }

      #{$c}__action-icon {
        fill: rgb(var(--color-base-green-normal));
      }
    }
  }
}
</style>
