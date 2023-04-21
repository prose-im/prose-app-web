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
import { shallowRef, PropType } from "vue";
import { jid, JID } from "@xmpp/jid";
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

// PROJECT: STORES
import Store from "@/store";
import { InboxEntryMessage, EventMessageGeneric } from "@/store/tables/inbox";
import { EventAvatarGeneric } from "@/store/tables/avatar";

// PROJECT: BROKER
import Broker from "@/broker";

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
  fontSize: "13.5px",
  paddingBottom: "25px"
};

const POPOVER_ANCHOR_HEIGHT_Y_OFFSET = 7;

export default {
  name: "InboxMessaging",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    }
  },

  data() {
    return {
      // --> DATA <--

      storeEvents: {
        "message:inserted": [Store.$inbox, this.onStoreMessageInserted],
        "message:updated": [Store.$inbox, this.onStoreMessageUpdated],
        "message:retracted": [Store.$inbox, this.onStoreMessageRetracted],
        "avatar:changed": [Store.$avatar, this.onStoreAvatarChangedOrFlushed],
        "avatar:flushed": [Store.$avatar, this.onStoreAvatarChangedOrFlushed]
      },

      // --> STATE <--

      isFrameLoaded: false,
      isMessageSyncStale: true,

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

  computed: {
    selfJID(): JID {
      return this.account.getLocalJID();
    },

    account(): typeof Store.$account {
      return Store.$account;
    },

    session(): typeof Store.$session {
      return Store.$session;
    },

    messages(): ReturnType<typeof Store.$inbox.getMessages> {
      return Store.$inbox.getMessages(this.jid);
    }
  },

  watch: {
    jid: {
      immediate: true,

      handler(newValue: JID, oldValue: JID) {
        if (newValue && (!oldValue || newValue.equals(oldValue) === false)) {
          // Mark as stale
          this.isMessageSyncStale = true;

          // Re-setup store (if runtime is available)
          const frameRuntime = this.frame();

          if (frameRuntime !== null) {
            this.setupStore(frameRuntime);
          }

          // Synchronize messages eagerly
          // TODO: re-assert store (do not sync if store already set, as we \
          //   are already connected and synced up)
          this.syncMessagesEager();
        }
      }
    }
  },

  created() {
    // TODO: put this in a utility helper

    // Bind connected handler
    Store.$session.events().on("connected", this.onStoreConnected);

    // Synchronize messages eagerly
    this.syncMessagesEager();
  },

  beforeUnmount() {
    // Unbind connected handler
    Store.$session.events().off("connected", this.onStoreConnected);

    // Un-setup store
    this.unsetupStore();
  },

  methods: {
    // --> HELPERS <--

    frame(): MessagingRuntime | null {
      if (this.$refs.frame) {
        const frameWindow = (this.$refs.frame as HTMLIFrameElement)
          .contentWindow as MessagingRuntime;

        // Return when ready only
        if (frameWindow && frameWindow.MessagingContext !== undefined) {
          return frameWindow;
        }
      }

      return null;
    },

    setupDocument(runtime: MessagingRuntime): void {
      // Generate custom inline style
      const inlineStyle = `
        ${styleElementsFonts}

        #app {
          font-family: "${FRAME_STYLE.fontFamily}";
          font-size: ${FRAME_STYLE.fontSize};
          padding-bottom: ${FRAME_STYLE.paddingBottom};
        }
      `;

      // Append style element
      const styleElement = runtime.document.createElement("style");

      styleElement.type = "text/css";
      styleElement.innerHTML = inlineStyle;

      runtime.document.head.appendChild(styleElement);
    },

    setupContext(runtime: MessagingRuntime): void {
      runtime.MessagingContext.setLanguage("en");
      runtime.MessagingContext.setStylePlatform(MessagingPlatform.Web);
      runtime.MessagingContext.setStyleTheme(MessagingTheme.Light);
      runtime.MessagingContext.setAccountJID(this.selfJID.toString());
    },

    setupEvents(runtime: MessagingRuntime): void {
      // Subscribe to messaging events
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

      // Subscribe to store events
      for (let [eventName, eventPath] of Object.entries(this.storeEvents)) {
        eventPath[0].events().on(eventName, eventPath[1]);
      }
    },

    setupStore(runtime: MessagingRuntime): void {
      // Identify both parties
      this.identifyPartyLocal(runtime);
      this.identifyPartyRemote(runtime);

      // Mark as initializing?
      if (this.isMessageSyncStale === true) {
        runtime.MessagingStore.loader("forwards", true);
      }

      // Pre-flush the store
      runtime.MessagingStore.flush();

      // Insert all messages already in store
      runtime.MessagingStore.insert(...this.messages);
    },

    setupListeners(runtime: MessagingRuntime): void {
      runtime.addEventListener("click", this.onFrameInnerClick);
    },

    unsetupStore(): void {
      for (let [eventName, eventPath] of Object.entries(this.storeEvents)) {
        eventPath[0].events().off(eventName, eventPath[1]);
      }
    },

    identifyPartyLocal(runtime: MessagingRuntime): void {
      // Identify local party
      runtime.MessagingStore.identify(this.selfJID.toString(), {
        name: Store.$roster.getEntryName(this.selfJID),
        avatar: Store.$avatar.getAvatarDataUrl(this.selfJID)
      });
    },

    identifyPartyRemote(runtime: MessagingRuntime): void {
      // Identify remote party
      runtime.MessagingStore.identify(this.jid.bare().toString(), {
        name: Store.$roster.getEntryName(this.jid),
        avatar: Store.$avatar.getAvatarDataUrl(this.jid)
      });
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

    async syncMessagesEager(): void {
      // Can synchronize now? (connected)
      if (
        this.isMessageSyncStale === true &&
        Store.$session.connected === true
      ) {
        // Mark synchronization as non-stale
        this.isMessageSyncStale = false;

        // Find last message with an archive identifier
        let lastResultIdFromArchive = undefined;

        if (this.messages.length > 0) {
          for (let i = this.messages.length - 1; i >= 0; i--) {
            const archiveId = this.messages[i].archiveId || undefined;

            if (archiveId !== undefined) {
              lastResultIdFromArchive = archiveId;

              // Stop as soon as last archive identifier was found
              break;
            }
          }
        }

        // Load all messages
        // Notice: only load messages after last loaded identifier
        const result = await Broker.$mam.loadMessages(this.jid, {
          afterId: lastResultIdFromArchive
        });

        const frameRuntime = this.frame();

        if (frameRuntime !== null) {
          // Mark forwards loading as complete
          frameRuntime.MessagingStore.loader("forwards", false);

          // Mark backwards loading as complete?
          if (result.complete === true) {
            frameRuntime.MessagingStore.loader("backwards", false);
          }
        } else {
          this.$log.warn(
            `Could not show loaders in message frame runtime upon eagerly ` +
              `synchronizing messages, as it is not ready yet for: ${this.jid}`
          );
        }
      }
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

    onStoreConnected(connected: boolean): void {
      if (connected === true) {
        // Synchronize messages eagerly
        this.syncMessagesEager();
      } else {
        // Mark synchronization as stale (will re-synchronize when connection \
        //   is restored)
        this.isMessageSyncStale = true;
      }
    },

    onStoreMessageInserted(event: EventMessageGeneric): void {
      if (this.jid.equals(event.jid) === true) {
        // Insert into view
        this.frame().MessagingStore.insert(event.message);
      }
    },

    onStoreMessageUpdated(event: EventMessageGeneric): void {
      if (this.jid.equals(event.jid) === true) {
        // Update in view
        this.frame().MessagingStore.update(event.message.id, event.message);
      }
    },

    onStoreMessageRetracted(event: EventMessageGeneric): void {
      if (this.jid.equals(event.jid) === true) {
        // Retract from view
        this.frame().MessagingStore.retract(event.message.id);
      }
    },

    onStoreAvatarChangedOrFlushed({ jid }: EventAvatarGeneric): void {
      // Check if should re-identify (if runtime is available)
      const frameRuntime = this.frame();

      if (frameRuntime !== null) {
        // Re-identify remote party?
        if (this.jid.equals(jid) === true) {
          this.identifyPartyRemote(frameRuntime);
        }

        // Re-identify local party?
        if (this.selfJID.equals(jid) === true) {
          this.identifyPartyLocal(frameRuntime);
        }
      }
    },

    onEventMessageActionsView(event: EventMessageActionsView): void {
      this.$log.debug("Got message actions view", event);

      // Show popover with actions? (if any origin set)
      if (event.origin) {
        // Acquire message contents
        const messageData = this.frame().MessagingStore.resolve(event.id);

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

        // Build popover items
        const items = [
          {
            type: PopoverItemType.Button,
            icon: "doc.on.clipboard",
            label: "Copy text",
            click: this.onPopoverActionsCopyClick
          }
        ];

        if (messageData) {
          // Message exists for sure? Append more actions.
          items.push({
            type: PopoverItemType.Button,
            icon: "face.smiling",
            label: "Add reaction…",
            click: this.onPopoverActionsReactionClick
          });

          // Message from self? Append private actions.
          if (this.selfJID.equals(jid(messageData.from)) === true) {
            items.push(
              {
                type: PopoverItemType.Divider
              },

              {
                type: PopoverItemType.Button,
                icon: "pencil",
                label: "Edit message…",
                emphasis: true,
                disabled: !this.session.connected,
                click: this.onPopoverActionsEditClick
              },

              {
                type: PopoverItemType.Button,
                icon: "trash",
                label: "Remove message",
                color: "red",
                emphasis: true,
                disabled: !this.session.connected,
                click: this.onPopoverActionsRemoveClick
              }
            );
          }
        }

        // Show popover
        this.showPopover({
          anchor: event.origin.parent || event.origin.anchor,

          items,
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
