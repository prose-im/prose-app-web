<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-messaging(
  ref="container"
)
  iframe(
    @load="onFrameLoad"
    :class=`[
      "c-inbox-messaging__frame",
      {
        "c-inbox-messaging__frame--visible": isFrameLoaded
      }
    ]`
    src="/includes/views/messaging.html"
    ref="frame"
    sandbox="allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
  )

  base-popover-list(
    v-if="popover.items.length > 0"
    v-click-away="onPopoverClickAway"
    :items="popover.items"
    :context="popover.context"
    :style="popover.style"
    class="c-inbox-messaging__popover"
  )

  base-popover(
    v-else-if="popover.component"
    v-click-away="onPopoverClickAway"
    :style="popover.style"
    class="c-inbox-messaging__popover"
  )
    component(
      v-on="popover.listeners"
      :is="popover.component"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";
import {
  Messaging as MessagingRuntime,
  Platform as MessagingPlatform,
  Theme as MessagingTheme,
  EventMessageActionsView,
  EventMessageReactionsView,
  EventMessageReactionsReact,
  EventMessageHistorySeek
} from "@prose-im/prose-core-views/types/messaging";

// PROJECT: STYLES
import styleElementsFonts from "@/assets/stylesheets/elements/_elements.fonts.scss?inline";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import ToolEmojiPicker from "@/components/tool/ToolEmojiPicker.vue";
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";

// TYPES
type StatePopoverListeners = { [name: string]: (_: any) => void };
type StatePopoverInteraction = { id: string; action: string };

// INTERFACES
interface StatePopover {
  style: {
    insetBlockStart: string;
    insetInlineStart: string;
  };

  items: Array<PopoverItem>;
  component: null | object;

  context: null | object;
  listeners: null | StatePopoverListeners;
  interaction: null | StatePopoverInteraction;
}

// CONSTANTS
const FRAME_STYLE = {
  fontFamily: "Prose Outfit",
  fontSize: "13.5px"
};

const POPOVER_ANCHOR_HEIGHT_Y_OFFSET = 7;

const MESSAGE_FIXTURES = [
  {
    id: "b4d303b1-17c9-4863-81b7-bc5281f3590f",
    type: "text",
    date: "2022-06-22T19:15:03.000Z",
    from: "valerian@prose.org",
    content:
      "Quick message just to confirm that I asked the designers for a new illustration.",

    metas: {
      encrypted: true,
      edited: false
    }
  },

  {
    id: "2abc1d01-da43-45bd-8bdd-a1b37c072ff1",
    type: "text",
    date: "2022-06-22T19:15:04.000Z",
    from: "valerian@prose.org",
    content: "We need one more for the blog.",

    metas: {
      encrypted: true,
      edited: false
    }
  },

  {
    id: "fe685272-2a23-4701-9e4e-a9605697b8c7",
    type: "text",
    date: "2022-06-24T19:15:05.000Z",
    from: "valerian@prose.org",
    content: "Might be done tomorrow 😀",

    metas: {
      encrypted: true,
      edited: false
    },

    reactions: [
      {
        reaction: "🤠",
        authors: ["valerian@prose.org", "baptiste@crisp.chat"]
      },

      {
        reaction: "🚀",
        authors: ["baptiste@crisp.chat"]
      }
    ]
  }
];

export default {
  name: "InboxMessaging",

  data() {
    return {
      // --> STATE <--

      isFrameLoaded: false,

      popover: {
        style: {
          insetBlockStart: "0px",
          insetInlineStart: "0px"
        },

        items: [],
        component: null,

        context: null,
        listeners: null,
        interaction: null
      } as StatePopover
    };
  },

  methods: {
    // --> HELPERS <--

    frame(): MessagingRuntime {
      return (this.$refs.frame as HTMLIFrameElement)
        .contentWindow as MessagingRuntime;
    },

    setupDocument(runtime: MessagingRuntime): void {
      // Generate custom inline style
      const inlineStyle = `
        ${styleElementsFonts}

        #app {
          font-family: "${FRAME_STYLE.fontFamily}";
          font-size: ${FRAME_STYLE.fontSize};
        }
      `;

      // Append style element
      const styleElement = runtime.document.createElement("style");

      styleElement.type = "text/css";
      styleElement.innerHTML = inlineStyle;

      runtime.document.head.appendChild(styleElement);
    },

    setupContext(runtime: MessagingRuntime): void {
      // TODO: from dynamic context
      runtime.MessagingContext.setLanguage("en");
      runtime.MessagingContext.setStylePlatform(MessagingPlatform.Web);
      runtime.MessagingContext.setStyleTheme(MessagingTheme.Light);
      runtime.MessagingContext.setAccountJID("valerian@prose.org");
    },

    setupEvents(runtime: MessagingRuntime): void {
      runtime.MessagingEvent.on(
        "message:actions:view",
        this.onEventMessageActionsView
      );

      runtime.MessagingEvent.on(
        "message:reactions:view",
        this.onEventMessageReactionsView
      );

      runtime.MessagingEvent.on(
        "message:reactions:react",
        this.onEventMessageReactionsReact
      );

      runtime.MessagingEvent.on(
        "message:history:seek",
        this.onEventMessageHistorySeek
      );
    },

    setupStore(runtime: MessagingRuntime): void {
      // TODO: those are fixtures
      runtime.MessagingStore.loader("forwards", true);

      setTimeout(() => {
        runtime.MessagingStore.identify("valerian@prose.org", {
          name: "Valerian",
          avatar:
            "https://gravatar.com/avatar/b4cb8302ee37f985cc76190aaae1b40b?size=80"
        });

        runtime.MessagingStore.insert(...MESSAGE_FIXTURES);

        runtime.MessagingStore.loader("forwards", false);
      }, 500);
    },

    setupListeners(runtime: MessagingRuntime): void {
      runtime.addEventListener("click", this.onFrameInnerClick);
    },

    showPopover({
      anchor,
      items,
      component,
      context,
      listeners,
      interaction
    }: {
      anchor: { x: number; y: number; height?: number };
      items?: Array<PopoverItem>;
      component?: object;
      context?: object;
      listeners?: StatePopoverListeners;
      interaction?: StatePopoverInteraction;
    }): void {
      // Clear any previously-shown popover
      this.hidePopover();

      // Compute popover position relative to anchor
      const positionX = anchor.x || 0;

      const positionY =
        (anchor.y || 0) +
        (anchor.height ? anchor.height + POPOVER_ANCHOR_HEIGHT_Y_OFFSET : 0);

      this.popover.style.insetBlockStart = `${positionY}px`;
      this.popover.style.insetInlineStart = `${positionX}px`;

      // Assign context (or empty)
      this.popover.context = context || {};

      // Assign listeners (or empty)
      this.popover.listeners = listeners || {};

      // Assign items and/or component (will show popover)
      this.popover.items = items || [];
      this.popover.component = component || null;

      // Propagate interaction?
      if (interaction) {
        this.popover.interaction = interaction;

        this.frame().MessagingStore.interact(
          interaction.id,
          interaction.action,
          true
        );
      }
    },

    hidePopover(): void {
      // Empty items + component (will hide popover)
      this.popover.items = [];
      this.popover.component = null;

      // Any interaction to hide?
      if (this.popover.interaction) {
        this.frame().MessagingStore.interact(
          this.popover.interaction.id,
          this.popover.interaction.action,
          false
        );

        this.popover.interaction = null;
      }
    },

    triggerContainerClick(): void {
      // Trigger ghost click event on container (so that eg. the click away \
      //   directive handles the click event accordingly)
      (this.$refs.container as HTMLElement).click();
    },

    // --> EVENT LISTENERS <--

    onFrameLoad(): void {
      const frameRuntime = this.frame();

      // Setup frame
      this.setupDocument(frameRuntime);
      this.setupContext(frameRuntime);
      this.setupEvents(frameRuntime);
      this.setupStore(frameRuntime);
      this.setupListeners(frameRuntime);

      // Mark frame as loaded
      this.isFrameLoaded = true;
    },

    onFrameInnerClick(): void {
      // Trigger container click
      this.triggerContainerClick();
    },

    onPopoverClickAway(): void {
      // Hide popover (if any opened)
      this.hidePopover();
    },

    onPopoverActionsCopyClick({ messageId }: { messageId: string }): void {
      // Acquire message contents
      const messageData = this.frame().MessagingStore.resolve(messageId);

      if (messageData && messageData.type === "text" && messageData.text) {
        // Copy to clipboard
        navigator.clipboard
          .writeText(messageData.text)
          .then(() => {
            this.$log.info(`Copied message text: ${messageData.text}`);

            BaseAlert.success(
              "Text copied",
              "Message text was copied to clipboard"
            );

            // Hide popover
            this.hidePopover();
          })
          .catch(error => {
            this.$log.info(
              `Could not copy message text: ${messageData.text}`,
              error
            );

            BaseAlert.error(
              "Cannot copy text",
              "Message text could not be copied to clipboard"
            );
          });
      } else {
        BaseAlert.warning(
          "No text to copy",
          "This message does not contain any text to copy"
        );
      }
    },

    onPopoverActionsReactionClick({ messageId }: { messageId: string }): void {
      // TODO: open reaction popover at same position as reaction button

      // TODO: temporary alert
      BaseAlert.warning("Not implemented");
    },

    onPopoverActionsEditClick({ messageId }: { messageId: string }): void {
      // Highlight message to edit
      this.frame().MessagingStore.highlight(messageId);

      // TODO: enter edit mode

      // Hide popover
      this.hidePopover();
    },

    onPopoverActionsRemoveClick({ messageId }: { messageId: string }): void {
      // Remove from store
      // TODO: move this to a store/factory?
      const wasRemoved = this.frame().MessagingStore.retract(messageId);

      // TODO: send removal order to protocol

      // Acknowledge removal
      if (wasRemoved === true) {
        BaseAlert.info("Message removed", "The message has been deleted");

        // Hide popover
        this.hidePopover();
      } else {
        BaseAlert.error(
          "Cannot remove message",
          "The message could not be deleted"
        );
      }
    },

    onPopoverReactionsPick({
      messageId,
      emoji
    }: {
      messageId: string;
      emoji: string;
    }): void {
      // TODO: react to message
    },

    onEventMessageActionsView(event: EventMessageActionsView): void {
      this.$log.debug("Got message actions view", event);

      // Show popover with actions? (if any origin set)
      if (event.origin) {
        // Build context
        const context = {
          messageId: event.id
        };

        // Build popover interaction (if button origin)
        const interaction =
          event.origin.type === "button"
            ? {
                id: event.id,
                action: "actions"
              }
            : undefined;

        // Show popover
        this.showPopover({
          anchor: event.origin.parent || event.origin.anchor,

          items: [
            // TODO: dynamically insert second part if message is from self

            {
              type: PopoverItemType.Button,
              icon: "doc.on.clipboard",
              label: "Copy text",
              click: this.onPopoverActionsCopyClick
            },

            {
              type: PopoverItemType.Button,
              icon: "face.smiling",
              label: "Add reaction…",
              click: this.onPopoverActionsReactionClick
            },

            {
              type: PopoverItemType.Divider
            },

            {
              type: PopoverItemType.Button,
              icon: "pencil",
              label: "Edit message…",
              emphasis: true,
              click: this.onPopoverActionsEditClick
            },

            {
              type: PopoverItemType.Button,
              icon: "trash",
              label: "Remove message",
              color: "red",
              emphasis: true,
              click: this.onPopoverActionsRemoveClick
            }
          ],

          context,
          interaction
        });

        // Trigger container click
        this.triggerContainerClick();
      }
    },

    onEventMessageReactionsView(event: EventMessageReactionsView): void {
      this.$log.debug("Got message reactions view", event);

      // Show popover with actions? (if any origin set)
      if (event.origin) {
        // Build listeners
        const listeners = {
          pick: (emoji: string) => {
            this.onPopoverReactionsPick({ messageId: event.id, emoji });
          }
        };

        // Build popover interaction (if button origin)
        const interaction =
          event.origin.type === "button"
            ? {
                id: event.id,
                action: "reactions"
              }
            : undefined;

        // Show popover
        this.showPopover({
          anchor: event.origin.parent || event.origin.anchor,
          component: shallowRef(ToolEmojiPicker),
          listeners,
          interaction
        });

        // Trigger container click
        this.triggerContainerClick();
      }
    },

    onEventMessageReactionsReact(event: EventMessageReactionsReact): void {
      this.$log.debug("Got message reactions react", event);

      // TODO: add/retract reaction to message
    },

    onEventMessageHistorySeek(event: EventMessageHistorySeek): void {
      this.$log.debug("Got message history seek", event);

      // TODO: load messages from history
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-messaging";

.c-inbox-messaging {
  position: relative;

  #{$c}__frame {
    height: 100%;
    width: 100%;
    visibility: hidden;

    &--visible {
      visibility: visible;
    }
  }

  #{$c}__popover {
    position: absolute;
    z-index: 1;
  }
}
</style>
