<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.a-inbox-messaging(
  ref="container"
)
  iframe(
    @load="onFrameLoad"
    :class=`[
      "a-inbox-messaging__frame",
      {
        "a-inbox-messaging__frame--visible": isFrameLoaded
      }
    ]`
    src="/includes/views/messaging.html"
    ref="frame"
    sandbox="allow-same-origin allow-scripts"
  )

  base-overlay(
    v-if="hasPlaceholder"
    class="a-inbox-messaging__placeholder"
  )
    base-placeholder-image(
      illustration="conversation-empty"
      title="Don't be shy!"
      description="It's pretty quiet around here, send your first message to get the conversation rolling."
    )

  inbox-messaging-alert(
    v-else-if="unreadCount > 0 && !isLastUnreadMessageVisible"
    @click="onAlertUnreadClick"
    icon="arrow.down"
    class="a-inbox-messaging__alert a-inbox-messaging__alert--bottom"
  )
    | {{ unreadCount }} unread {{ (unreadCount === 1) ? 'message' : 'messages' }} below

  base-popover-list(
    v-if="popover.items.length > 0"
    @close="onPopoverClose"
    :items="popover.items"
    :context="popover.context"
    :style="popover.style"
    class="a-inbox-messaging__popover"
  )

  base-popover(
    v-else-if="popover.component"
    @close="onPopoverClose"
    :style="popover.style"
    :focus="popover.focus"
    class="a-inbox-messaging__popover"
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

  message-details(
    v-if="popups.messageDetails.visible"
    @close="onPopupMessageDetailsClose"
    :room="room"
    :message-id="popups.messageDetails.messageId"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import {
  EventMessageActionsView,
  EventMessageFileView,
  EventMessageLinkOpen,
  EventMessageHistoryView,
  EventMessageHistorySeek,
  EventMessageReactionsReact,
  EventMessageReactionsView,
  FileAction as MessagingFileAction,
  FileType as MessagingFileType,
  Modifier as MessagingModifier,
  Platform as MessagingPlatform,
  Messaging as MessagingRuntime,
  ViewVisibility as MessagingViewVisibility,
  SeekDirection as MessagingSeekDirection,
  Theme as MessagingTheme
} from "@prose-im/prose-core-views/types/messaging";
import {
  JID,
  Room,
  SendMessageRequest,
  SendMessageRequestBody
} from "@prose-im/prose-sdk-js";
import { PropType, shallowRef } from "vue";
import { Handler as MittHandler } from "mitt";
import FileDownloader from "js-file-downloader";

// PROJECT: STYLES
import styleElementsFonts from "@/assets/stylesheets/elements/_elements.fonts.scss?inline";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import {
  Item as PopoverItem,
  ItemType as PopoverItemType
} from "@/components/base/BasePopoverList.vue";
import {
  Collection as FilePreviewCollection,
  File as FilePreviewFile,
  FileType as FilePreviewFileType
} from "@/components/inbox/InboxFilePreview.vue";
import InboxMessagingAlert from "@/components/inbox/InboxMessagingAlert.vue";
import ToolEmojiPicker from "@/components/tool/ToolEmojiPicker.vue";

// PROJECT: MODALS
import RemoveMessage from "@/modals/inbox/RemoveMessage.vue";
import EditMessage from "@/modals/inbox/EditMessage.vue";

// PROJECT: POPUPS
import MessageDetails from "@/popups/inbox/MessageDetails.vue";

// PROJECT: COMPOSABLES
import { useEvents } from "@/composables/events";

// PROJECT: STORES
import Store from "@/store";
import { EventAvatarGeneric } from "@/store/tables/avatar";
import {
  InboxNameOrigin,
  InboxEntryName,
  InboxEntryStateLoading,
  InboxInsertMode,
  EventMessageGeneric,
  EventNameGeneric,
  EventStateLoadingGeneric
} from "@/store/tables/inbox";
import { SessionAppearance } from "@/store/tables/session";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

// ENUMERATIONS
export enum MessageReactionMode {
  // Add reaction.
  Add = "add",
  // Retract reaction.
  Retract = "retract"
}

// TYPES
type StatePopoverAnchor = { x: number; y: number; height?: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StatePopoverListeners = { [name: string]: (_: any) => void };
type StatePopoverInteraction = { id: string; action: string };

// INTERFACES
interface StatePopover {
  style: {
    insetBlockStart: string;
    insetInlineStart: string;
  };

  focus: boolean;

  items: Array<PopoverItem>;
  component: null | object;

  context: null | object;
  listeners: null | StatePopoverListeners;
  interaction: null | StatePopoverInteraction;
}

// CONSTANTS
const FRAME_STYLE = {
  app: {
    fontFamily: "Prose Outfit",
    fontSize: "13.5px",
    paddingBottom: "25px"
  },

  code: {
    fontFamily: "Prose Hack"
  }
};

const CHECK_MARK_READ_DELAY = 500; // 1/2 second

const POPOVER_ANCHOR_HEIGHT_Y_OFFSET = 7;

export default {
  name: "InboxMessaging",

  components: {
    InboxMessagingAlert,
    MessageDetails,
    EditMessage,
    RemoveMessage
  },

  props: {
    room: {
      type: Object as PropType<Room>,
      default: undefined
    }
  },

  emits: ["filePreview", "dragover"],

  data() {
    return {
      // --> DATA <--

      storeEvents: {
        "message:restored": [Store.$inbox, this.onStoreMessageRestored],
        "message:inserted": [Store.$inbox, this.onStoreMessageInserted],
        "message:updated": [Store.$inbox, this.onStoreMessageUpdated],
        "message:retracted": [Store.$inbox, this.onStoreMessageRetracted],
        "name:changed": [Store.$inbox, this.onStoreNameChanged],
        "state:loading:marked": [Store.$inbox, this.onStoreStateLoadingMarked],
        "avatar:changed": [Store.$avatar, this.onStoreAvatarChangedOrFlushed],
        "avatar:flushed": [Store.$avatar, this.onStoreAvatarChangedOrFlushed]
      },

      messagingEvents: {
        "message:actions:view": this.onMessagingMessageActionsView,
        "message:reactions:view": this.onMessagingMessageReactionsView,
        "message:reactions:react": this.onMessagingMessageReactionsReact,
        "message:file:view": this.onMessagingMessageFileView,
        "message:link:open": this.onMessagingMessageLinkOpen,
        "message:history:view": this.onMessagingMessageHistoryView,
        "message:history:seek": this.onMessagingMessageHistorySeek
      },

      // --> STATE <--

      isFrameLoaded: false,
      isLastUnreadMessageVisible: false,

      visibleMessageIds: new Set() as Set<string>,

      checkMarkReadTimeout: null as null | ReturnType<typeof setTimeout>,

      modals: {
        removeMessage: {
          visible: false,

          context: {
            messageId: ""
          }
        },

        editMessage: {
          visible: false,
          originalText: "",

          context: {
            messageId: ""
          }
        }
      },

      popups: {
        messageDetails: {
          visible: false,

          messageId: ""
        }
      },

      popover: {
        style: {
          insetBlockStart: "0px",
          insetInlineStart: "0px"
        },

        focus: true,

        items: [],
        component: null,

        context: null,
        listeners: null,
        interaction: null
      } as StatePopover
    };
  },

  computed: {
    isMessageSyncStale(): boolean {
      const archivesTimestamp = this.states?.archives.acquiredAt,
        connectionTimestamp = this.session.lastConnectedAt;

      return (
        archivesTimestamp === undefined ||
        connectionTimestamp === null ||
        connectionTimestamp > archivesTimestamp
      );
    },

    hasAnyLoader(): boolean {
      return this.states?.loading.backwards || this.states?.loading.forwards
        ? true
        : false;
    },

    hasPlaceholder(): boolean {
      return (
        this.hasAnyLoader === false &&
        this.isMessageSyncStale !== true &&
        this.messages.length === 0
      );
    },

    unreadCount(): number {
      return this.roomItem?.unreadCount || 0;
    },

    selfJID(): JID {
      return this.account.getSelfJID();
    },

    selfName(): string {
      return this.account.getInformationName();
    },

    account(): typeof Store.$account {
      return Store.$account;
    },

    session(): typeof Store.$session {
      return Store.$session;
    },

    settings(): typeof Store.$settings {
      return Store.$settings;
    },

    messages(): ReturnType<typeof Store.$inbox.getMessages> {
      return this.room ? Store.$inbox.getMessages(this.room.id) : [];
    },

    names(): ReturnType<typeof Store.$inbox.getNames> {
      return this.room ? Store.$inbox.getNames(this.room.id) : {};
    },

    states(): ReturnType<typeof Store.$inbox.getStates> | void {
      return this.room ? Store.$inbox.getStates(this.room.id) : undefined;
    },

    roomItem(): ReturnType<typeof Store.$room.getRoomItem> {
      return this.room ? Store.$room.getRoomItem(this.room.id) : undefined;
    }
  },

  watch: {
    room: {
      immediate: true,

      handler(newValue: Room, oldValue: Room) {
        if (newValue && (!oldValue || newValue.id !== oldValue.id)) {
          // Re-setup store (if runtime is available)
          const frameRuntime = this.frame();

          if (frameRuntime !== null) {
            this.setupStore(frameRuntime);

            // Synchronize messages eagerly
            this.syncMessagesEager();
          }
        }
      }
    }
  },

  created() {
    // Bind session event handlers
    useEvents(Store.$session, {
      connected: this.onStoreConnected,
      visible: this.onStoreVisible,
      appearance: this.onStoreAppearance
    });
  },

  beforeUnmount() {
    // Clear registered timeouts
    this.unscheduleCheckMarkReadTimeout();

    // Un-setup store
    this.unsetupStore();
  },

  methods: {
    // --> EXTERNALS <--

    editLastFromParent(): void {
      let lastSelfMessageId = null,
        selfJIDString = this.selfJID.toString();

      // Find last message from self (if any)
      for (let i = this.messages.length - 1; i >= 0; i--) {
        let message = this.messages[i];

        if (selfJIDString === message.from && message.id) {
          lastSelfMessageId = message.id;

          break;
        }
      }

      // Any message identifier found?
      if (lastSelfMessageId !== null) {
        this.showEditMessage(lastSelfMessageId);
      }
    },

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
          font-family: "${FRAME_STYLE.app.fontFamily}";
          font-size: ${FRAME_STYLE.app.fontSize};
          padding-bottom: ${FRAME_STYLE.app.paddingBottom};
        }

        #app code {
          font-family: "${FRAME_STYLE.code.fontFamily}";
        }
      `;

      // Append style element
      const styleElement = runtime.document.createElement("style");

      styleElement.innerHTML = inlineStyle;

      runtime.document.head.appendChild(styleElement);
    },

    setupContext(runtime: MessagingRuntime): void {
      runtime.MessagingContext.setLanguage("en");
      runtime.MessagingContext.setStylePlatform(MessagingPlatform.Web);
      runtime.MessagingContext.setAccountJID(this.selfJID.toString());
    },

    setupTheme(runtime: MessagingRuntime): void {
      // Apply style theme (as needed)
      switch (this.session.appearance) {
        case SessionAppearance.Light: {
          runtime.MessagingContext.setStyleTheme(MessagingTheme.Light);

          break;
        }

        case SessionAppearance.Dark: {
          runtime.MessagingContext.setStyleTheme(MessagingTheme.Dark);

          break;
        }
      }
    },

    setupEvents(runtime: MessagingRuntime): void {
      // Subscribe to messaging events
      for (let [eventName, eventHandler] of Object.entries(
        this.messagingEvents
      )) {
        runtime.MessagingEvent.on(
          eventName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          eventHandler as (event: any) => void
        );
      }

      // Subscribe to store events
      for (let [eventName, eventPath] of Object.entries(this.storeEvents)) {
        // Hack: alias event path store as 'Store.$inbox' since it is \
        //   guaranteed to contain the 'events()' method. Other stores also \
        //   implement the same method with the exact same prototype.
        (eventPath[0] as typeof Store.$inbox)
          .events()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .on(eventName, eventPath[1] as MittHandler<any>);
      }
    },

    setupStore(runtime: MessagingRuntime): void {
      // Reset visible message identifiers
      this.resetCheckMarkRead();

      // Pre-flush the store
      runtime.MessagingStore.flush();

      // Register global names
      this.registerGlobalNames();

      // Identify all parties
      this.identifyAllParties(runtime);

      // Insert all messages already in store
      runtime.MessagingStore.insert(...this.messages);

      // Restore loaders? (if states are known)
      if (this.states) {
        this.refreshLoaders(runtime, this.states.loading);
      }
    },

    unsetupStore(): void {
      for (let [eventName, eventPath] of Object.entries(this.storeEvents)) {
        (eventPath[0] as typeof Store.$inbox)
          .events()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .off(eventName, eventPath[1] as MittHandler<any>);
      }
    },

    setupListeners(runtime: MessagingRuntime): void {
      runtime.addEventListener("click", this.onFrameInnerClick);
      runtime.addEventListener("dragover", this.onFrameDragOver);
    },

    identifyAllParties(runtime: MessagingRuntime): void {
      // Identify all parties
      Object.values(this.names).forEach((name: InboxEntryName) => {
        this.identifyParty(runtime, name.from, name.name);
      });
    },

    identifyParty(
      runtime: MessagingRuntime,
      jidStringMaybe: string,
      name: string
    ): void {
      // Attempt to parse JID, since the JID string might contain a resource \
      //   part for MUC rooms here, which is not allowed in bare JIDs. In the \
      //   case JID parsing fails, then we will not attempt to acquire the \
      //   avatar attached to that JID.
      let jidMaybe: JID | null;

      try {
        jidMaybe = new JID(jidStringMaybe);
      } catch (_) {
        jidMaybe = null;
      }

      // Identify party
      // Important: do not try to acquire avatars for full JIDs, as those \
      //   come from MUC full JIDs and thus we do not have any avatar for them \
      //   anyway, plus they are not parsable as bare JIDs.
      runtime.MessagingStore.identify(jidStringMaybe, {
        name,

        avatar:
          jidMaybe !== null
            ? Store.$avatar.getAvatarDataUrl(jidMaybe) || undefined
            : undefined
      });
    },

    refreshLoaders(
      runtime: MessagingRuntime,
      loading: InboxEntryStateLoading
    ): void {
      let direction: keyof InboxEntryStateLoading;

      for (direction in loading) {
        const directionValue = loading[direction];

        if (directionValue !== undefined) {
          runtime.MessagingStore.loader(direction, directionValue);
        }
      }
    },

    registerGlobalNames(): void {
      const roomId = this.room?.id || null;

      if (roomId !== null) {
        // Register self name
        Store.$inbox.setName(
          roomId,
          this.selfJID.toString(),
          this.selfName,
          InboxNameOrigin.Global
        );

        // Register participant names
        // Notice: those names are preferred over the per-message names, since \
        //   they are guaranteed to be always up-to-date. Those are defined \
        //   secondly since they may overwrite per-message names, which is \
        //   desired.
        this.room?.participants.forEach(member => {
          if (member.jid) {
            Store.$inbox.setName(
              roomId,
              member.jid.toString(),
              member.name,
              InboxNameOrigin.Global
            );
          }
        });
      }
    },

    scheduleCheckMarkReadTimeout(): void {
      // Unschedule any already registered check mark read timeout
      this.unscheduleCheckMarkReadTimeout();

      // Schedule next check mark read timeout
      this.checkMarkReadTimeout = setTimeout(() => {
        this.triggerCheckMarkRead();
      }, CHECK_MARK_READ_DELAY);
    },

    unscheduleCheckMarkReadTimeout(): void {
      if (this.checkMarkReadTimeout !== null) {
        clearTimeout(this.checkMarkReadTimeout);

        this.checkMarkReadTimeout = null;
      }
    },

    triggerCheckMarkRead(): void {
      if (this.unreadCount > 0) {
        // Acquire last message from non-self
        let lastNonSelfMessageId = null,
          selfJIDString = this.selfJID.toString();

        // Find last message from non-self (if any)
        for (let i = this.messages.length - 1; i >= 0; i--) {
          let message = this.messages[i];

          if (selfJIDString !== message.from && message.id) {
            lastNonSelfMessageId = message.id;

            break;
          }
        }

        // Update last message visible marker
        this.isLastUnreadMessageVisible =
          lastNonSelfMessageId !== null &&
          this.visibleMessageIds.has(lastNonSelfMessageId) === true
            ? true
            : false;

        // Mark as read? (application is in focus)
        if (
          this.session.visible === true &&
          this.isLastUnreadMessageVisible === true
        ) {
          this.room?.markAsRead();

          // No unread (anymore), mark last unread as visible
          this.isLastUnreadMessageVisible = true;
        }
      } else {
        // No unread, mark last unread as visible
        this.isLastUnreadMessageVisible = true;
      }
    },

    resetCheckMarkRead(): void {
      // Flush visible message identifiers from registry
      this.visibleMessageIds.clear();

      // Unschedule any already registered check mark read timeout
      this.unscheduleCheckMarkReadTimeout();

      // Reset states
      this.isLastUnreadMessageVisible = false;
    },

    showPopover({
      anchor,
      items,
      component,
      context,
      listeners,
      interaction,
      focus
    }: {
      anchor: StatePopoverAnchor;
      items?: Array<PopoverItem>;
      component?: object;
      context?: object;
      listeners?: StatePopoverListeners;
      interaction?: StatePopoverInteraction;
      focus?: boolean;
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

      // Assign popover focus option (or default)
      this.popover.focus = focus !== undefined ? focus : true;

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

    async syncMessagesEager(): Promise<void> {
      // Freeze room reference (since we're going asynchronous and it might \
      //   change in the state mid-way)
      const room = this.room;

      // Messages are stale and room is known?
      if (this.isMessageSyncStale === true && room) {
        // Mark as initializing
        Store.$inbox.updateLoading(room.id, {
          forwards: true
        });

        // Can synchronize now? (connected)
        if (this.session.connected === true) {
          this.$log.info(`Will load latest messages for: ${room.id}`);

          // Mark archives as acquired (ie. non-stale)
          // Notice: do it early to prevent double concurrent loads.
          Store.$inbox.markArchivesAcquired(room.id);

          // Load all messages
          try {
            const result = await room.loadLatestMessages();

            // Update last archive identifier
            Store.$inbox.setArchivesLastArchiveId(
              room.id,
              result.lastMessageId
            );

            // Check if should insert or restore messages?
            // Notice: this is required if there are already messages in the \
            //   store, that could be more recent than those messages, eg. if \
            //   a new message was received in-band and the room is opened later.
            // Important: acquire insert mode AFTER loading messages and \
            //   BEFORE inserting them to the store, since the loading could \
            //   have taken quite some time, and some messages might have been \
            //   inserted in the store mid-way.
            const insertMode =
              this.messages.length > 0
                ? InboxInsertMode.Restore
                : InboxInsertMode.Insert;

            // Insert messages to store
            Store.$inbox.insertCoreMessages(room, result.messages, insertMode);
          } catch (error) {
            // Alert of load error
            this.$log.error(
              `Could not load latest messages, since an unrecoverable ` +
                `error occurred for: ${room.id}`,
              error
            );

            BaseAlert.error(
              "Failed loading messages",
              "Latest messages could not be loaded"
            );
          } finally {
            // Mark forwards loading as complete
            Store.$inbox.updateLoading(room.id, {
              forwards: false
            });
          }
        }
      }
    },

    async seekMoreMessages(): Promise<void> {
      // Freeze room reference (since we're going asynchronous and it might \
      //   change in the state mid-way)
      const room = this.room;

      // Can seek now? (connected and not stale)
      if (
        this.session.connected === true &&
        room &&
        this.isMessageSyncStale !== true &&
        this.states?.loading.backwards !== true
      ) {
        const frameRuntime = this.frame();

        // Acquire last archive identifier (page before this identifier, if any)
        const lastArchiveId = this.states?.archives.lastArchiveId;

        // Load previous messages?
        if (lastArchiveId !== undefined && frameRuntime !== null) {
          this.$log.info(`Will seek previous messages for: ${room.id}`);

          // Mark backwards as loading
          Store.$inbox.updateLoading(room.id, {
            backwards: true
          });

          try {
            // Load earlier messages
            const result = await room.loadMessagesBefore(lastArchiveId);

            // Update last archive identifier
            Store.$inbox.setArchivesLastArchiveId(
              room.id,
              result.lastMessageId
            );

            // Insert messages to store
            Store.$inbox.insertCoreMessages(
              room,
              result.messages,
              InboxInsertMode.Restore
            );
          } catch (error) {
            // Alert of load error
            this.$log.error(
              `Could not seek previous messages, since an unrecoverable ` +
                `error occurred for: ${room.id}`,
              error
            );

            BaseAlert.warning(
              "Failed loading messages",
              "Older messages could not be loaded"
            );
          } finally {
            // Mark backwards loading as complete
            Store.$inbox.updateLoading(room.id, {
              backwards: false
            });
          }
        } else {
          this.$log.warn(
            `Could not seek previous messages, as there is no first ` +
              `message from archives, start of archive has been already ` +
              `reached or frame is not ready yet for: ${room.id}`
          );
        }
      }
    },

    async sendMessageReaction(
      mode: MessageReactionMode,
      messageId: string,
      reaction: string
    ): Promise<void> {
      // Freeze room reference (since we're going asynchronous and it might \
      //   change in the state mid-way)
      const room = this.room;

      // Generate list of reactions
      const reactions: Set<string> = new Set(),
        existingMessage = room
          ? Store.$inbox.getMessage(room.id, messageId)
          : undefined;

      if (
        existingMessage !== undefined &&
        existingMessage.reactions !== undefined &&
        existingMessage.reactions.length > 0
      ) {
        const selfJIDString = this.selfJID.toString();

        existingMessage.reactions.forEach(
          (reaction: { reaction: string; authors: string[] }) => {
            if (reaction.authors.includes(selfJIDString) === true) {
              reactions.add(reaction.reaction as string);
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
        // Send reaction to network
        for (const reaction of reactions) {
          await room?.toggleReactionToMessage(messageId, reaction);
        }
      }
    },

    showEditMessage(messageId: string): void {
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
          this.modals.editMessage.originalText = messageData.content;

          this.modals.editMessage.visible = true;
        } else {
          BaseAlert.warning(
            "No text to edit",
            "The message does not contain any text to edit"
          );
        }
      }
    },

    makeFilePreviewFile(event: EventMessageFileView): FilePreviewFile {
      return {
        type: event.file.type as FilePreviewFileType,
        url: event.file.url,
        name: event.file.name || ""
      };
    },

    openInlineChat(jidString: string): void {
      try {
        const jid = new JID(jidString);

        if (jid.equals(this.selfJID) === false) {
          this.$router.push({
            name: "app.inbox",

            params: {
              roomId: jidString
            }
          });
        } else {
          BaseAlert.warning(
            "This is you",
            "Cannot start a chat with yourself!"
          );
        }
      } catch (error) {
        this.$log.error(
          `Could not open inline conversation with: '${jidString}'`,
          error
        );
      }
    },

    // --> EVENT LISTENERS <--

    onFrameLoad(): void {
      const frameRuntime = this.frame();

      // Setup frame?
      if (frameRuntime !== null) {
        // Setup frame
        this.setupDocument(frameRuntime);
        this.setupContext(frameRuntime);
        this.setupTheme(frameRuntime);
        this.setupEvents(frameRuntime);
        this.setupStore(frameRuntime);
        this.setupListeners(frameRuntime);

        // Synchronize messages eagerly
        this.syncMessagesEager();
      }

      // Mark frame as loaded
      this.isFrameLoaded = true;
    },

    onFrameDragOver(event: DragEvent): void {
      // Prevent frame to capture 'dragover' event (it is impossible to catch \
      //   for a parent if capture is not prevented there)
      event.preventDefault();
      event.stopPropagation();

      // Re-emit event to parent
      this.$emit("dragover", event);
    },

    onFrameInnerClick(): void {
      // Trigger container click
      this.triggerContainerClick();
    },

    onAlertUnreadClick(): void {
      // Acquire last message identifier? (if any)
      if (this.messages.length > 0) {
        let lastMessageId = this.messages[this.messages.length - 1].id || null;

        // Dispatch scroll to last message?
        if (lastMessageId !== null) {
          let hasScrolled = this.frame()?.MessagingStore.scroll(lastMessageId);

          // Mark last unread message as visible straight away? (if scrolled)
          if (hasScrolled === true) {
            this.isLastUnreadMessageVisible = true;
          }
        }
      }
    },

    async onModalEditMessageEdit(
      { messageId }: { messageId: string },
      text: string
    ): Promise<void> {
      // Freeze room reference (since we're going asynchronous and it might \
      //   change in the state mid-way)
      const room = this.room;

      // Acquire frame runtime
      const frameRuntime = this.frame();

      try {
        // Load message original data
        const originalMessage = (
          await room?.loadMessagesWithIDs([messageId])
        )?.[0];

        // Send update to network
        let messageRequest = new SendMessageRequest(),
          messageRequestBody = new SendMessageRequestBody();

        // Generate message body
        // TODO: restore message mentions (when rich-text editor is made \
        //   common between inbox-form and message editor)
        messageRequestBody.text = text;
        messageRequest.body = messageRequestBody;

        // Restore message attachments?
        if (
          originalMessage?.attachments &&
          originalMessage?.attachments?.length > 0
        ) {
          messageRequest.attachments = originalMessage.attachments;
        }

        await room?.updateMessage(messageId, messageRequest);
      } catch (error) {
        // Alert of copy error
        this.$log.error(`Could not edit message #${messageId}`, error);

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

    async onModalRemoveMessageRemove({
      messageId
    }: {
      messageId: string;
    }): Promise<void> {
      // Freeze room reference (since we're going asynchronous and it might \
      //   change in the state mid-way)
      const room = this.room;

      // Remove from store
      const wasRemoved = room
        ? Store.$inbox.retractMessage(room.id, messageId)
        : false;

      // Message removed in store? Proceed actual network removal & acknowledge
      if (wasRemoved === true) {
        // Send removal to network
        await room?.retractMessage(messageId);
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

    onPopupMessageDetailsClose(): void {
      this.popups.messageDetails.visible = false;
    },

    onPopoverClose(): void {
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
          this.$log.error(
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
        interaction,
        focus: false
      });
    },

    onPopoverActionsEditClick({ messageId }: { messageId: string }): void {
      // Show message editor
      this.showEditMessage(messageId);
    },

    onPopoverActionsRemoveClick({ messageId }: { messageId: string }): void {
      // Hide popover
      this.hidePopover();

      // Show confirm modal
      this.modals.removeMessage.context.messageId = messageId;
      this.modals.removeMessage.visible = true;
    },

    onPopoverActionsDetailsClick({ messageId }: { messageId: string }): void {
      // Hide popover
      this.hidePopover();

      // Show details popup?
      // Notice: room is required to be defined for the popup to work
      if (this.room) {
        this.popups.messageDetails.messageId = messageId;
        this.popups.messageDetails.visible = true;
      }
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
      this.sendMessageReaction(MessageReactionMode.Add, messageId, emoji);
    },

    onStoreConnected(connected: boolean): void {
      if (connected === true) {
        // Synchronize messages eagerly?
        if (this.frame() !== null) {
          this.syncMessagesEager();
        }
      }
    },

    onStoreVisible(visible: boolean): void {
      // Check if should mark unread messages as read?
      if (visible === true) {
        this.triggerCheckMarkRead();
      }
    },

    onStoreAppearance(): void {
      const frameRuntime = this.frame();

      if (frameRuntime !== null) {
        // Re-setup theme
        this.setupTheme(frameRuntime);
      }
    },

    onStoreMessageRestored(event: EventMessageGeneric): void {
      if (this.room?.id === event.roomId) {
        // Restore into view
        this.frame()?.MessagingStore.restore(event.message);
      }
    },

    onStoreMessageInserted(event: EventMessageGeneric): void {
      if (this.room?.id === event.roomId) {
        // Insert into view
        this.frame()?.MessagingStore.insert(event.message);
      }
    },

    onStoreMessageUpdated(event: EventMessageGeneric): void {
      if (this.room?.id === event.roomId) {
        const messageId = (event.original || event.message).id || undefined;

        // Update in view?
        if (messageId !== undefined) {
          // Notice: use identifier from original message as reference, if any, \
          //   otherwise fallback on the actual message. This is done as the \
          //   message identifier must (should?) be migrated to a new one upon \
          //   update.
          this.frame()?.MessagingStore.update(messageId, event.message);
        }
      }
    },

    onStoreMessageRetracted(event: EventMessageGeneric): void {
      if (this.room?.id === event.roomId) {
        const messageId = event.message.id || undefined;

        // Retract from view?
        if (messageId !== undefined) {
          this.frame()?.MessagingStore.retract(messageId);
        }
      }
    },

    onStoreNameChanged(event: EventNameGeneric): void {
      if (this.room?.id === event.roomId) {
        // Check if should re-identify (if runtime is available)
        const frameRuntime = this.frame();

        if (frameRuntime !== null) {
          // Re-identify party
          this.identifyParty(frameRuntime, event.from, event.name);
        }
      }
    },

    onStoreStateLoadingMarked(event: EventStateLoadingGeneric): void {
      if (this.room && this.room?.id === event.roomId) {
        const frameRuntime = this.frame();

        if (frameRuntime !== null) {
          this.refreshLoaders(frameRuntime, event.loading);
        } else {
          this.$log.warn(
            `Could not update loaders, as frame is not ready yet for: ` +
              `${this.room.id}`
          );
        }
      }
    },

    onStoreAvatarChangedOrFlushed({ jid }: EventAvatarGeneric): void {
      // Check if should re-identify (if runtime is available)
      const frameRuntime = this.frame();

      if (frameRuntime !== null) {
        // Re-identify party w/ new avatar? (if JID found in names)
        const jidString = jid.toString(),
          name = this.names[jidString] || null;

        if (name !== null) {
          this.identifyParty(frameRuntime, name.from, name.name);
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
        const items: Array<PopoverItem> = [
          {
            type: PopoverItemType.Button,
            label: "Copy text",
            click: this.onPopoverActionsCopyClick,

            icon: {
              name: "doc.on.clipboard"
            }
          }
        ];

        if (messageData) {
          // Message exists for sure? Append more actions.
          items.push({
            type: PopoverItemType.Button,
            label: "Add reaction…",

            icon: {
              name: "face.smiling"
            },

            click: () => {
              this.onPopoverActionsReactionClick({
                anchor,
                interaction,
                context
              });
            }
          });

          // Message from self? Append private actions.
          if (this.selfJID.toString() === messageData.from) {
            items.push(
              {
                type: PopoverItemType.Divider
              },

              {
                type: PopoverItemType.Button,
                label: "Edit message…",
                emphasis: true,
                disabled: !this.session.connected,
                click: this.onPopoverActionsEditClick,

                icon: {
                  name: "pencil"
                }
              },

              {
                type: PopoverItemType.Button,
                label: "Remove message",
                color: "red",
                emphasis: true,
                disabled: !this.session.connected,
                click: this.onPopoverActionsRemoveClick,

                icon: {
                  name: "trash"
                }
              }
            );
          }

          // Append information actions
          items.push(
            {
              type: PopoverItemType.Divider
            },

            {
              type: PopoverItemType.Button,
              label: "Show details",
              color: "lighter",
              click: this.onPopoverActionsDetailsClick,

              icon: {
                name: "plus.viewfinder"
              }
            }
          );
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
          interaction,
          focus: false
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

      this.sendMessageReaction(reactionMode, event.id, event.reaction);
    },

    async onMessagingMessageFileView(
      event: EventMessageFileView
    ): Promise<void> {
      this.$log.debug("Got message file view", event);

      // Handle file view action
      switch (event.action) {
        case MessagingFileAction.Expand: {
          if (event.file.type !== MessagingFileType.Other) {
            const fileCollection: FilePreviewCollection = [];

            // Map previous files (only expand actions)
            event.adjacents?.before.forEach(adjacent => {
              if (adjacent.action === MessagingFileAction.Expand) {
                fileCollection.push(this.makeFilePreviewFile(adjacent));
              }
            });

            // Append current file
            fileCollection.push(this.makeFilePreviewFile(event));

            const fileIndex = fileCollection.length - 1;

            // Map next files (only expand actions)
            event.adjacents?.after.forEach(adjacent => {
              if (adjacent.action === MessagingFileAction.Expand) {
                fileCollection.push(this.makeFilePreviewFile(adjacent));
              }
            });

            // Request to expand file into preview
            this.$emit("filePreview", fileCollection, fileIndex);
          } else {
            this.$log.error(
              `Cannot expand non-media file of type: ${event.file.type}`
            );
          }

          break;
        }

        case MessagingFileAction.Download: {
          try {
            // Trigger a browser download of the file
            await new FileDownloader({
              url: event.file.url,
              filename: event.file.name || undefined
            });
          } catch (error) {
            this.$log.error(
              `Could not download file from message file view event at URL: ` +
                `${event.file.url}`,
              error
            );
          }

          break;
        }

        default: {
          this.$log.error(`Got unsupported file view action: ${event.action}`);
        }
      }
    },

    async onMessagingMessageLinkOpen(
      event: EventMessageLinkOpen
    ): Promise<void> {
      this.$log.debug("Got message link open", event);

      // Handle link protocol
      switch (event.link.protocol) {
        case "xmpp": {
          // Open as an inline conversation
          const jidString = event.link.url.split(":")[1] || null;

          if (jidString !== null && jidString !== this.room?.id) {
            this.openInlineChat(jidString);
          }

          break;
        }

        default: {
          // Open URL as a new tab (ie. browser window)
          try {
            await UtilitiesRuntime.requestOpenUrl(event.link.url);
          } catch (error) {
            this.$log.error(
              `Failed opening URL from message link open at: ${event.link.url}`,
              error
            );
          }
        }
      }
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
    },

    onMessagingMessageHistoryView(event: EventMessageHistoryView): void {
      // Notice: do not log anything there, as this event can be quite spammy \
      //   when the user scrolls, and we do not want to pollute our debug logs \
      //   too much here.

      // Handle view visibility
      switch (event.visibility) {
        case MessagingViewVisibility.Visible: {
          this.visibleMessageIds.add(event.id);

          // Schedule next mark as read (if there are unreads to be marked as \
          //   read)
          this.scheduleCheckMarkReadTimeout();

          break;
        }

        case MessagingViewVisibility.Hidden: {
          this.visibleMessageIds.delete(event.id);

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
$c: ".a-inbox-messaging";

// VARIABLES
$heads-up-edge-offset: 12px;

#{$c} {
  position: relative;

  #{$c}__frame {
    height: 100%;
    width: 100%;
    visibility: hidden;

    &--visible {
      visibility: visible;
    }
  }

  #{$c}__alert {
    position: absolute;
    inset-inline-start: 50%;
    transform: translateX(-50%);

    &--top {
      inset-block-start: $heads-up-edge-offset;
    }

    &--bottom {
      inset-block-end: $heads-up-edge-offset;
    }
  }

  #{$c}__placeholder {
    position: absolute;
    inset: 0;
  }

  #{$c}__popover {
    position: absolute;
    z-index: 1;
  }
}
</style>
