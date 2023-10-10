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
        :disabled="true || isFormDisabled"
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
        :room="room"
        :composing="states.composing"
        class="a-inbox-form__compose-chatstate"
      )

      .a-inbox-form__compose-inner
        form-field(
          v-model="message"
          @keystroke="onKeystroke"
          @submit="onSubmit"
          :disabled="isFormDisabled"
          :placeholder="fieldComposePlaceholder"
          class="a-inbox-form__compose-field"
          type="textarea"
          name="message"
          size="large"
          align="left"
          ref="message"
          submittable
          autogrow
        )

        base-button(
          :disabled="isFormDisabled"
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
        :disabled="true || isFormDisabled"
        class="a-inbox-form__action"
        icon="paperclip"
        size="18px"
      )

      base-action(
        @click="onActionEmojisClick"
        :active="isActionEmojisPopoverVisible"
        :disabled="isFormDisabled"
        class="a-inbox-form__action"
        icon="face.smiling"
        size="18px"
      )
        base-popover(
          v-if="isActionEmojisPopoverVisible"
          v-click-away="onActionEmojisPopoverClickAway"
          class="a-inbox-form__action-popover a-inbox-form__action-popover--right"
        )
          tool-emoji-picker(
            @pick="onEmojiPick"
          )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, Room, RoomType } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: COMPONENTS
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";
import FormField from "@/components/form/FormField.vue";
import InboxFormChatstate from "@/components/inbox/InboxFormChatstate.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER

// CONSTANTS
const CHATSTATE_COMPOSE_INACTIVE_DELAY = 5000; // 5 seconds

export default {
  name: "InboxForm",

  components: { InboxFormChatstate },

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    }
  },

  data() {
    return {
      // --> STATE <--

      message: "",

      isActionFormattingPopoverVisible: false,
      isActionEmojisPopoverVisible: false,

      isUserComposing: false,
      chatStateComposeTimeout: null as null | ReturnType<typeof setTimeout>
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

    fieldComposePlaceholder(): string {
      return `Message ${this.rosterName}`;
    },

    isFormDisabled(): boolean {
      return !this.session.connected ? true : false;
    },

    session(): typeof Store.$session {
      return Store.$session;
    },

    states(): ReturnType<typeof Store.$inbox.getStates> {
      return [];
      //return Store.$inbox.getStates(this.jid);
    },

    rosterName(): ReturnType<typeof Store.$roster.getEntryName> {
      return this.$props.room.name;
    }
  },

  beforeUnmount() {
    // Clear registered timeouts
    this.unscheduleChatStateComposeTimeout();
  },

  methods: {
    // --> HELPERS <--

    async propagateChatState(composing: boolean): Promise<void> {
      // Propagate new chat state?
      if (composing !== this.isUserComposing) {
        this.isUserComposing = composing;
        await this.$props.room.setUserIsComposing(composing);
      }
    },

    scheduleChatStateComposeTimeout(): void {
      this.chatStateComposeTimeout = setTimeout(() => {
        // Propagate paused chat state
        this.propagateChatState(false);
      }, CHATSTATE_COMPOSE_INACTIVE_DELAY);
    },

    unscheduleChatStateComposeTimeout(): void {
      if (this.chatStateComposeTimeout !== null) {
        clearTimeout(this.chatStateComposeTimeout);

        this.chatStateComposeTimeout = null;
      }
    },

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

    onEmojiPick(glyph: string): void {
      // Insert emoji glyph into message field
      // Notice: prefix with a separator space if field is non-empty.
      if (this.message && this.message[this.message.length - 1] !== " ") {
        this.message += " ";
      }

      this.message += glyph;

      // Close emoji popover
      this.isActionEmojisPopoverVisible = false;

      // Focus on input
      (this.$refs.message as typeof FormField).focusField();
    },

    onKeystroke(value: string): void {
      // Clear compose chat state timeout (as needed)
      this.unscheduleChatStateComposeTimeout();

      // Acquire current chat state
      const isComposing = value.length > 0;

      // Propagate new chat state (as needed)
      this.propagateChatState(isComposing);

      // Re-schedule compose timeout?
      if (isComposing === true) {
        this.scheduleChatStateComposeTimeout();
      }
    },

    async onSubmit(): Promise<void> {
      const message = this.message.trim();

      if (message) {
        // Clear compose chat state timeout (as needed)
        this.unscheduleChatStateComposeTimeout();

        // Mark user as not composing anymore.
        this.isUserComposing = false;

        if (message.startsWith("/invite ")) {
          const jid = new JID(message.substring("/invite ".length).trim());

          switch (this.$props.room.type) {
            case RoomType.DirectMessage:
            case RoomType.Group:
            case RoomType.Generic:
              console.warn("This room type does not allow inviting users");
              break;

            case RoomType.PrivateChannel:
            case RoomType.PublicChannel:
              console.info(
                `Inviting user ${jid} to room ${this.$props.room.id}`
              );
              await this.$props.room.inviteUsers([jid.toString()]);
              break;
          }
          this.message = "";
          return;
        }

        // Send message
        await this.$props.room.sendMessage(message);

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
        fill: rgb(var(--color-white));
        margin-inline-start: -2px;
      }
    }

    #{$c}__compose-chatstate {
      padding-inline: $size-form-field-large-padding-sides;
      position: absolute;
      inset-inline-start: 0;
      inset-block-end: calc(100% - 5px);
      z-index: 1;
    }
  }
}
</style>
