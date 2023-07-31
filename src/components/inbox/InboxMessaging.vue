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

  edit-message(
    v-if="modals.editMessage.visible"
    @edit="onModalEditMessageEdit"
    @close="onModalEditMessageClose"
    :context="modals.editMessage.context"
    :original-text="modals.editMessage.originalText"
  )

  remove-message(
    v-if="modals.removeMessage.visible"
    @remove="onModalRemoveMessageRemove"
    @close="onModalRemoveMessageClose"
    :context="modals.removeMessage.context"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef, PropType } from "vue";
import xmppID from "@xmpp/id";
import { JID } from "@prose-im/prose-core-client-wasm";
import {
  Messaging as MessagingRuntime,
  Platform as MessagingPlatform,
  Theme as MessagingTheme,
  Modifier as MessagingModifier,
  SeekDirection as MessagingSeekDirection,
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

// PROJECT: MODALS
import EditMessage from "@/modals/inbox/EditMessage.vue";
import RemoveMessage from "@/modals/inbox/RemoveMessage.vue";

// PROJECT: STORES
import Store from "@/store";
import { EventMessageGeneric } from "@/store/tables/inbox";
import { EventAvatarGeneric } from "@/store/tables/avatar";

// PROJECT: BROKER
import Broker from "@/broker";
import { MessageReaction } from "@/broker/stanzas/message";

// ENUMERATIONS
export enum MessageReactionMode {
  // Add reaction.
  Add = "add",
  // Retract reaction.
  Retract = "retract"
}

// TYPES
type StatePopoverAnchor = { x: number; y: number; height?: number };
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

  components: { EditMessage, RemoveMessage },

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

      messagingEvents: {
        "message:actions:view": this.onMessagingMessageActionsView,
        "message:reactions:view": this.onMessagingMessageReactionsView,
        "message:reactions:react": this.onMessagingMessageReactionsReact,
        "message:history:seek": this.onMessagingMessageHistorySeek
      },

      // --> STATE <--

      isFrameLoaded: false,
      isMessageSyncStale: true,
      isMessageSyncMoreLoading: false,

      modals: {
        removeMessage: {
          visible: false,
          context: {}
        },

        editMessage: {
          visible: false,
          context: {},
          originalText: ""
        }
      },

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
      for (let [eventName, eventHandler] of Object.entries(
        this.messagingEvents
      )) {
        runtime.MessagingEvent.on(eventName, eventHandler);
      }

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
      runtime.MessagingStore.identify(this.jid.toString(), {
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
      anchor: StatePopoverAnchor;
      items?: Array<PopoverItem>;
      component?: object;
      context?: object;
      listeners?: StatePopoverListeners;
      interaction?: StatePopoverInteraction;
    }): void {
      const frameRuntime = this.frame();

      // Clear any previously-shown popover
      // Notice: mark hider as 'will show'
      this.hidePopover(true);

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

        frameRuntime?.MessagingStore.interact(
          interaction.id,
          interaction.action,
          true
        );
      }

      // Lock scroll
      frameRuntime?.MessagingContext.setStyleModifier(
        MessagingModifier.Scroll,
        false
      );
    },

    hidePopover(willShow = false): void {
      const frameRuntime = this.frame();

      // Empty items + component (will hide popover)
      this.popover.items = [];
      this.popover.component = null;

      // Any interaction to hide?
      if (this.popover.interaction) {
        frameRuntime?.MessagingStore.interact(
          this.popover.interaction.id,
          this.popover.interaction.action,
          false
        );

        this.popover.interaction = null;
      }

      // Unlock scroll? (if will not show next)
      // Notice: this avoids setting style modifiers twice
      if (willShow !== true) {
        frameRuntime?.MessagingContext.setStyleModifier(
          MessagingModifier.Scroll,
          true
        );
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
        await Broker.$mam.loadLatestMessages(this.jid);

        const frameRuntime = this.frame();

        if (frameRuntime !== null) {
          // Mark forwards loading as complete
          frameRuntime.MessagingStore.loader("forwards", false);

          // TODO: Fix backwards loading after updating core lib
          // Mark backwards loading as complete?
          // if (result.complete === true) {
          //   frameRuntime.MessagingStore.loader("backwards", false);
          // }
        } else {
          this.$log.warn(
            `Could not show loaders in message frame runtime upon eagerly ` +
              `synchronizing messages, as it is not ready yet for: ${this.jid}`
          );
        }
      }
    },

    async seekMoreMessages(): Promise<void> {
      // Can seek now? (connected and not stale)
      // TODO: Fix condition after updating core lib
      if (
        true
        // Store.$session.connected === true &&
        // this.isMessageSyncStale !== true &&
        // this.isMessageSyncMoreLoading !== true
      ) {
        const frameRuntime = this.frame();

        // Find first message with an archive identifier
        let firstResultIdFromArchive =
          this.messages.find(message => {
            return message.archiveId !== undefined ? true : false;
          })?.archiveId || undefined;

        // Load previous messages?
        // Notice: only load messages after first loaded identifier
        if (firstResultIdFromArchive !== undefined && frameRuntime !== null) {
          // Mark backwards as loading
          this.isMessageSyncMoreLoading = true;

          frameRuntime.MessagingStore.loader("backwards", true);

          // TODO: this one is not working
          await Broker.$mam.loadLatestMessages(this.jid);

          // Mark backwards loading as complete
          frameRuntime.MessagingStore.loader("backwards", false);

          this.isMessageSyncMoreLoading = false;
        } else {
          this.$log.warn(
            `Could not seek previous messages, as there is no first ` +
              `message from archives or frame is not ready yet for: ${this.jid}`
          );
        }
      }
    },

    sendMessageReaction(
      mode: MessageReactionMode,
      messageId: string,
      reaction: MessageReaction
    ): void {
      // Generate list of reactions
      const reactions: Set<MessageReaction> = new Set(),
        existingMessage = Store.$inbox.getMessage(this.jid, messageId);

      if (
        existingMessage !== undefined &&
        existingMessage.reactions !== undefined &&
        existingMessage.reactions.length > 0
      ) {
        const selfJIDRaw = this.selfJID.toString();

        existingMessage.reactions.forEach(
          (reaction: { reaction: string; authors: string[] }) => {
            if (reaction.authors.includes(selfJIDRaw) === true) {
              reactions.add(reaction.reaction as MessageReaction);
            }
          }
        );
      }

      // Add or retract reaction? (as needed)
      let shouldPropagate = false;

      switch (mode) {
        case MessageReactionMode.Add: {
          if (reactions.has(reaction) === false) {
            reactions.add(reaction);

            shouldPropagate = true;
          }

          break;
        }

        case MessageReactionMode.Retract: {
          if (reactions.has(reaction) === true) {
            reactions.delete(reaction);

            shouldPropagate = true;
          }

          break;
        }
      }

      // Apply reaction changes?
      if (shouldPropagate === true) {
        // TODO: update store

        // Send reaction to network
        Broker.$chat.sendReactions(messageId, this.jid, reactions);
      }
    },

    // --> EVENT LISTENERS <--

    onFrameLoad(): void {
      const frameRuntime = this.frame();

      // Setup frame?
      if (frameRuntime !== null) {
        this.setupDocument(frameRuntime);
        this.setupContext(frameRuntime);
        this.setupEvents(frameRuntime);
        this.setupStore(frameRuntime);
        this.setupListeners(frameRuntime);
      }

      // Mark frame as loaded
      this.isFrameLoaded = true;
    },

    onFrameInnerClick(): void {
      // Trigger container click
      this.triggerContainerClick();
    },

    onModalEditMessageEdit(
      { messageId, messageType }: { messageId: string; messageType: string },
      text: string
    ): void {
      const frameRuntime = this.frame();

      // Generate new message ID
      const updatedMessageId = xmppID();

      // Update in store
      const wasUpdated = Store.$inbox.updateMessage(this.jid, messageId, {
        id: updatedMessageId,
        type: messageType,
        content: text
      });

      // Message updated in store? Proceed actual network edit & acknowledge
      if (wasUpdated === true) {
        // Send update to network
        Broker.$chat.updateMessage(this.jid, text, {
          original: messageId,
          replacement: updatedMessageId
        });

        // Acknowledge update
        BaseAlert.info("Message edited", "The message has been updated");
      } else {
        BaseAlert.error(
          "Cannot edit message",
          "The message could not be updated"
        );
      }

      // Close modal
      this.modals.editMessage.visible = false;

      // Un-highlight edited message
      frameRuntime?.MessagingStore.highlight(null);
    },

    onModalEditMessageClose(): void {
      this.modals.editMessage.visible = false;

      // Un-highlight message to edit
      this.frame()?.MessagingStore.highlight(null);
    },

    onModalRemoveMessageRemove({ messageId }: { messageId: string }): void {
      // Remove from store
      const wasRemoved = Store.$inbox.retractMessage(this.jid, messageId);

      // Message removed in store? Proceed actual network removal & acknowledge
      if (wasRemoved === true) {
        // Send removal to network
        Broker.$chat.retractMessage(messageId, this.jid);

        // Acknowledge removal
        BaseAlert.info("Message removed", "The message has been deleted");
      } else {
        BaseAlert.error(
          "Cannot remove message",
          "The message could not be deleted"
        );
      }

      // Close modal
      this.modals.removeMessage.visible = false;
    },

    onModalRemoveMessageClose(): void {
      this.modals.removeMessage.visible = false;
    },

    onPopoverClickAway(): void {
      // Hide popover (if any opened)
      this.hidePopover();
    },

    async onPopoverActionsCopyClick({
      messageId
    }: {
      messageId: string;
    }): Promise<void> {
      // Acquire message contents
      const messageData = this.frame()?.MessagingStore.resolve(messageId);

      if (messageData && messageData.type === "text" && messageData.content) {
        try {
          // Copy to clipboard
          await navigator.clipboard.writeText(messageData.content);

          // Acknowledge copy
          this.$log.info(`Copied message text: ${messageData.content}`);

          BaseAlert.success(
            "Text copied",
            "Message text was copied to clipboard"
          );

          // Hide popover
          this.hidePopover();
        } catch (error) {
          // Alert of copy error
          this.$log.info(
            `Could not copy message text: ${messageData.content}`,
            error
          );

          BaseAlert.error(
            "Cannot copy text",
            "Message text could not be copied to clipboard"
          );
        }
      } else {
        BaseAlert.warning(
          "No text to copy",
          "This message does not contain any text to copy"
        );
      }
    },

    onPopoverActionsReactionClick({
      anchor,
      interaction,
      context
    }: {
      anchor: StatePopoverAnchor;
      interaction?: StatePopoverInteraction;
      context: { messageId: string };
    }): void {
      // Build listeners
      const listeners = {
        pick: (emoji: string) => {
          this.onPopoverReactionsPick({ messageId: context.messageId, emoji });
        }
      };

      // Show popover
      this.showPopover({
        anchor,
        component: shallowRef(ToolEmojiPicker),
        context,
        listeners,
        interaction
      });
    },

    onPopoverActionsEditClick({ messageId }: { messageId: string }): void {
      const frameRuntime = this.frame();

      if (frameRuntime !== null) {
        // Acquire message contents
        const messageData = frameRuntime.MessagingStore.resolve(messageId);

        if (messageData && messageData.type === "text" && messageData.content) {
          // Hide popover
          this.hidePopover();

          // Highlight message to edit
          frameRuntime.MessagingStore.highlight(messageId);

          // Show edit modal
          this.modals.editMessage.context.messageId = messageId;
          this.modals.editMessage.context.messageType = messageData.type;

          this.modals.editMessage.originalText = messageData.content;

          this.modals.editMessage.visible = true;
        } else {
          BaseAlert.warning(
            "No text to edit",
            "This message does not contain any text to edit"
          );
        }
      }
    },

    onPopoverActionsRemoveClick({ messageId }: { messageId: string }): void {
      // Hide popover
      this.hidePopover();

      // Show confirm modal
      this.modals.removeMessage.context.messageId = messageId;
      this.modals.removeMessage.visible = true;
    },

    onPopoverReactionsPick({
      messageId,
      emoji
    }: {
      messageId: string;
      emoji: string;
    }): void {
      // Hide popover
      this.hidePopover();

      // Send message reaction
      this.sendMessageReaction(
        MessageReactionMode.Add,
        messageId,
        emoji as MessageReaction
      );
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
        this.frame()?.MessagingStore.insert(event.message);
      }
    },

    onStoreMessageUpdated(event: EventMessageGeneric): void {
      if (this.jid.equals(event.jid) === true) {
        // Update in view
        // Notice: use identifier from original message as reference, if any, \
        //   otherwise fallback on the actual message. This is done as the \
        //   message identifier must (should?) be migrated to a new one upon \
        //   update.
        this.frame()?.MessagingStore.update(
          (event.original || event.message).id,
          event.message
        );
      }
    },

    onStoreMessageRetracted(event: EventMessageGeneric): void {
      if (this.jid.equals(event.jid) === true) {
        // Retract from view
        this.frame()?.MessagingStore.retract(event.message.id);
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

    onMessagingMessageActionsView(event: EventMessageActionsView): void {
      this.$log.debug("Got message actions view", event);

      // Show popover with actions? (if any origin set)
      if (event.origin) {
        // Acquire message contents
        const messageData = this.frame()?.MessagingStore.resolve(event.id);

        // Build context
        const context = {
          messageId: event.id
        };

        // Acquire anchor
        const anchor = event.origin.parent || event.origin.anchor;

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

            click: () => {
              this.onPopoverActionsReactionClick({
                anchor,
                interaction,
                context
              });
            }
          });

          // Message from self? Append private actions.
          if (
            messageData.from &&
            this.selfJID.equals(new JID(messageData.from)) === true
          ) {
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
          anchor,
          items,
          context,
          interaction
        });

        // Trigger container click
        this.triggerContainerClick();
      }
    },

    onMessagingMessageReactionsView(event: EventMessageReactionsView): void {
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

    onMessagingMessageReactionsReact(event: EventMessageReactionsReact): void {
      this.$log.debug("Got message reactions react", event);

      // Add or retract message reaction
      const reactionMode =
        event.active === false
          ? MessageReactionMode.Retract
          : MessageReactionMode.Add;

      this.sendMessageReaction(
        reactionMode,
        event.id,
        event.reaction as MessageReaction
      );
    },

    onMessagingMessageHistorySeek(event: EventMessageHistorySeek): void {
      this.$log.debug("Got message history seek", event);

      // Handle seek direction
      switch (event.direction) {
        case MessagingSeekDirection.Backwards: {
          // Seek more messages from history
          this.seekMoreMessages();

          break;
        }

        case MessagingSeekDirection.Forwards: {
          // Nothing done here.

          break;
        }
      }
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
