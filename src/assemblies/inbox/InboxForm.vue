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
          v-click-away="onActionFormattingPopoverClickAway"
          :items="actionFormattingPopoverItems"
          class="a-inbox-form__action-popover a-inbox-form__action-popover--left"
        )

  template(
    v-slot:middle
  )
    form.a-inbox-form__compose(
      @submit.prevent="onSubmit"
    )
      inbox-form-chatstate(
        :chatstate="states.chatstate"
        class="a-inbox-form__compose-chatstate"
      )

      .a-inbox-form__compose-inner
        form-field(
          v-model="message"
          @submit="onSubmit"
          :disabled="!session.connected"
          class="a-inbox-form__compose-field"
          type="textarea"
          name="message"
          placeholder="Message Valerian"
          size="large"
          submittable
          autogrow
        )

        base-button(
          :disabled="!session.connected"
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
        base-popover(
          v-if="isActionEmojisPopoverVisible"
          v-click-away="onActionEmojisPopoverClickAway"
          class="a-inbox-form__action-popover a-inbox-form__action-popover--right"
        )
          tool-emoji-picker
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { jid } from "@xmpp/jid";

// PROJECT: COMPONENTS
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";
import InboxFormChatstate from "@/components/inbox/InboxFormChatstate.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

export default {
  name: "InboxForm",

  components: { InboxFormChatstate },

  data() {
    return {
      // --> STATE <--

      message: "",

      isActionFormattingPopoverVisible: false,
      isActionEmojisPopoverVisible: false
    };
  },

  computed: {
    actionFormattingPopoverItems(): Array<PopoverItem> {
      return [
        {
          type: PopoverItemType.Button,
          label: "Formatting items…",
          color: "blue"
        }
      ];
    },

    session(): typeof Store.$session {
      return Store.$session;
    },

    states(): ReturnType<typeof Store.$inbox.getStates> {
      // TODO: jid from url
      return Store.$inbox.getStates(jid("valerian@valeriansaliou.name"));
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onActionFormattingClick(): void {
      // Toggle popover
      this.isActionFormattingPopoverVisible =
        !this.isActionFormattingPopoverVisible;
    },

    onActionFormattingPopoverClickAway(): void {
      // Close popover
      this.isActionFormattingPopoverVisible = false;
    },

    onActionEmojisClick(): void {
      // Toggle popover
      this.isActionEmojisPopoverVisible = !this.isActionEmojisPopoverVisible;
    },

    onActionEmojisPopoverClickAway(): void {
      // Close popover
      this.isActionEmojisPopoverVisible = false;
    },

    onSubmit(): void {
      const message = this.message.trim();

      if (message) {
        // TODO: inject dynamic JID (from where?)
        const to = jid("valerian@valeriansaliou.name");

        // Send message
        Broker.$chat.sendMessage(to, message);

        // Clear message field
        this.message = "";
      }
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
    position: relative;

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

    #{$c}__compose-chatstate {
      padding-inline: $size-form-field-large-padding-sides;
      position: absolute;
      inset-inline-start: 0;
      inset-block-end: 100%;
      z-index: 1;
    }
  }
}
</style>
