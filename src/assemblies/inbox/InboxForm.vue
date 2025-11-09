<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
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
    layout-actions(
      class="a-inbox-form__actions"
    )
      base-tooltip(
        :tooltip="formatTooltip"
        align="left"
      )
        base-action(
          @click="onActionFormatClick"
          :active="isActionFormatFormattingVisible"
          :disabled="isFormDisabled"
          :size="actionIconSize"
          class="a-inbox-form__action"
          icon="textformat.alt"
        )

      base-tooltip(
        v-if="!isActionRecordRecorderVisible"
        align="left"
        tooltip="Record Audio"
      )
        base-action(
          @click="onActionRecordClick"
          :disabled="isFormDisabled"
          :size="actionIconSize"
          class="a-inbox-form__action"
          icon="mic"
        )

      inbox-form-recorder(
        v-else
        @audio="onRecorderAudio"
        @cancel="onRecorderCancel"
        @error="onRecorderError"
      )

  template(
    v-slot:middle
  )
    .a-inbox-form__compose
      inbox-form-chatstate(
        v-if="room"
        :room="room"
        :class=`[
          "a-inbox-form__compose-chatstate",
          {
            "a-inbox-form__compose-chatstate--with-formatting": isActionFormatFormattingVisible
          }
        ]`
      )

      inbox-form-formatting(
        v-if="isActionFormatFormattingVisible"
        @action="onFormattingAction"
        @mode="onFormattingMode"
        :disabled="isFormDisabled"
        :mode="formattingMode"
        class="a-inbox-form__compose-formatting"
      )

      inbox-form-preview(
        v-if="formattingMode === formattingModeOptions.Preview"
        :message="message"
        class="a-inbox-form__compose-preview"
      )

      form.a-inbox-form__compose-form(
        v-show="formattingMode === formattingModeOptions.Write"
        @submit.prevent="onSubmit"
      )
        form-field(
          v-model="message"
          @keystroke="onKeyStroke"
          @keyup="onKeyUp"
          @focus="onFocus"
          @submit="onSubmit"
          @refresh="onRefresh"
          :suggestions="fieldSuggestions"
          :disabled="isFormDisabled"
          :rows="1"
          :placeholder="fieldComposePlaceholder"
          :spellcheck="hasSpellCheck"
          class="a-inbox-form__compose-field"
          type="textarea"
          name="message"
          size="large"
          align="left"
          direction="top"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="none"
          ref="message"
          submittable
          autogrow
        )

        base-button(
          :disabled="isFormDisabled || !message"
          size="custom"
          type="submit"
          class="a-inbox-form__compose-send"
          button-class="a-inbox-form__compose-send-button"
        )
          template(
            v-slot:custom
          )
            base-icon(
              name="paperplane.fill"
              size="17px"
              class="a-inbox-form__compose-send-icon"
            )

  template(
    v-slot:right
  )
    layout-actions(
      class="a-inbox-form__actions"
    )
      base-tooltip(
        align="right"
        tooltip="Send Files"
      )
        base-action(
          :disabled="isFormDisabled"
          :size="actionIconSize"
          class="a-inbox-form__action"
          icon="paperclip"
        )
          template(
            v-slot:inner
          )
            inbox-form-attach(
              @file="onAttachFile"
            )

      base-tooltip(
        :bypassed="isActionEmojisPopoverVisible"
        align="right"
        tooltip="Emojis"
      )
        base-action(
          @click="onActionEmojisClick"
          :active="isActionEmojisPopoverVisible"
          :disabled="isFormDisabled"
          :size="actionIconSize"
          class="a-inbox-form__action"
          icon="face.smiling"
        )
          base-popover(
            v-if="isActionEmojisPopoverVisible"
            @close="onActionEmojisPopoverClose"
            :focus="false"
            class="a-inbox-form__action-popover a-inbox-form__action-popover--right"
          )
            tool-emoji-picker(
              @pick="onEmojiPick"
            )

  template(
    v-slot:default
  )
    inbox-form-loader(
      v-if="isAttachFilePending"
      class="a-inbox-form__loader"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import {
  JID,
  ParticipantId,
  Room,
  RoomType,
  SendMessageRequest,
  SendMessageRequestBody,
  UploadSlot
} from "@prose-im/prose-sdk-js";
import { codes as keyCodes } from "keycode";
import { useKeypress } from "vue3-keypress";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import BaseAvatar from "@/components/base/BaseAvatar.vue";
import {
  default as FormField,
  SelectionCursor as FieldSelectionCursor
} from "@/components/form/FormField.vue";
import { Suggestion as FormFieldSuggestSuggestion } from "@/components/form/FormFieldSuggest.vue";
import {
  default as InboxFormFormatting,
  FormattingAction,
  FormattingMode,
  FormattingSyntax,
  TAG_TEXT as FORMATTING_TAG_TEXT,
  TAG_INDEX as FORMATTING_TAG_INDEX
} from "@/components/inbox/InboxFormFormatting.vue";
import {
  default as InboxFormRecorder,
  Audio as RecorderAudio
} from "@/components/inbox/InboxFormRecorder.vue";
import InboxFormAttach from "@/components/inbox/InboxFormAttach.vue";
import InboxFormChatstate from "@/components/inbox/InboxFormChatstate.vue";
import InboxFormPreview from "@/components/inbox/InboxFormPreview.vue";
import InboxFormLoader from "@/components/inbox/InboxFormLoader.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: UTILITIES
import { default as UtilitiesUpload, UploadOptions } from "@/utilities/upload";

// ENUMERATIONS
export enum Request {
  // Preserve Scroll Position request.
  PreserveScrollPosition = "preserve-scroll-position",
  // Edit Last Message request.
  EditLastMessage = "edit-last-message"
}

// INSTANCES
const MESSAGE_TEXT_MENTION_REGEX = /(?:^|\s)@([^@\s]{0,80})$/;

// CONSTANTS
const CHATSTATE_COMPOSE_INACTIVE_DELAY = 10000; // 10 seconds
const DRAFT_AUTOSAVE_DEBOUNCE = 4000; // 4 seconds

export default {
  name: "InboxForm",

  components: {
    InboxFormFormatting,
    InboxFormRecorder,
    InboxFormAttach,
    InboxFormChatstate,
    InboxFormPreview,
    InboxFormLoader
  },

  props: {
    room: {
      type: Object as PropType<Room>,
      default: undefined
    }
  },

  emits: ["request"],

  data() {
    return {
      // --> DATA <--

      actionIconSize: "18px",

      formattingModeOptions: FormattingMode,

      // --> STATE <--

      message: "",

      formattingMode: FormattingMode.Write,

      mentionQuery: null as string | null,

      isMessageFieldFocused: false,

      isActionRecordRecorderVisible: false,
      isActionEmojisPopoverVisible: false,

      isUserComposing: false,
      isAttachFilePending: false,

      chatStateComposeTimeout: null as null | ReturnType<typeof setTimeout>,
      draftAutoSaveTimeout: null as null | ReturnType<typeof setTimeout>
    };
  },

  computed: {
    formatTooltip(): string {
      return this.isActionFormatFormattingVisible
        ? "Hide Formatting"
        : "Show Formatting";
    },

    fieldComposePlaceholder(): string {
      // Acquire room prefix
      let roomPrefix;

      switch (this.room?.type) {
        case RoomType.PrivateChannel:
        case RoomType.PublicChannel: {
          roomPrefix = "#";

          break;
        }

        default: {
          roomPrefix = "";
        }
      }

      // Any roster name set?
      if (this.rosterName) {
        return `Message ${roomPrefix}${this.rosterName}`;
      }

      return "Send a message";
    },

    fieldSuggestions(): Array<FormFieldSuggestSuggestion> {
      const suggestions: Array<FormFieldSuggestSuggestion> = [];

      if (this.mentionQuery !== null) {
        const mentionQuery = this.mentionQuery,
          appendRegister: Set<string> = new Set();

        // #1. Append matches from room participants
        this.room?.participants.forEach(participant => {
          if (participant.jid !== undefined) {
            this.appendSuggestionParticipant(
              suggestions,
              appendRegister,
              participant.jid.toString(),
              participant.id,
              participant.name,
              mentionQuery
            );
          }
        });

        // #2. Append matches from roster
        this.rosterContactList.forEach(entry => {
          this.appendSuggestionParticipant(
            suggestions,
            appendRegister,
            entry.jid,
            null,
            entry.name,
            mentionQuery
          );
        });
      }

      return suggestions;
    },

    isActionFormatFormattingVisible(): boolean {
      return this.layout.inbox.form.formatting;
    },

    isFormDisabled(): boolean {
      return !this.session.connected ? true : false;
    },

    hasSpellCheck(): boolean {
      return this.settings.messages.chats.spellcheck;
    },

    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    session(): typeof Store.$session {
      return Store.$session;
    },

    settings(): typeof Store.$settings {
      return Store.$settings;
    },

    rosterContactList(): ReturnType<typeof Store.$roster.getContactsList> {
      return Store.$roster.getContactsList();
    },

    rosterName(): string {
      return this.room?.name || "";
    }
  },

  watch: {
    room: {
      immediate: true,

      handler(newValue: Room, oldValue: Room) {
        // Save draft for old room, and stop composing?
        if (oldValue && (!newValue || newValue.id !== oldValue.id)) {
          this.propagateChatState(false, oldValue);
          this.fireDraftAutoSave(false, oldValue);
        }

        // Process new states
        if (newValue && (!oldValue || newValue.id !== oldValue.id)) {
          // Load draft for new room
          this.attemptDraftRestore(newValue);

          // Check if (still) uploading a file in this room
          this.isAttachFilePending = UtilitiesUpload.hasQueue(newValue.id);
        }

        // Attempt to auto-focus on the message field?
        // Notice: only auto-focus when changing from one room to another, if \
        //   we come from a previous room.
        if (newValue && oldValue && newValue.id !== oldValue.id) {
          this.focusMessageField();
        }
      }
    }
  },

  beforeMount() {
    // Listen for global key presses (useful to restore focus on message field)
    useKeypress({
      keyEvent: "keypress",
      keyBinds: [],
      onAnyKey: this.onGlobalKeyPress
    });
  },

  mounted() {
    // Auto-focus on the message field
    this.focusMessageField();
  },

  beforeUnmount() {
    // Clear registered timeouts
    this.unscheduleChatStateComposeTimeout();
    this.fireDraftAutoSave();
  },

  methods: {
    // --> EXTERNALS <--

    insertMessageFieldFromParent(text: string): void {
      // Insert message text
      this.insertMessageField(text);
    },

    async attachFileFromParent(file: File): Promise<void> {
      // Trigger attach file event (this is an alias)
      await this.onAttachFile(file);
    },

    // --> HELPERS <--

    async propagateChatState(composing: boolean, room?: Room): Promise<void> {
      // Clear compose chat state timeout (as needed)
      this.unscheduleChatStateComposeTimeout();

      // Propagate new chat state?
      if (composing !== this.isUserComposing) {
        this.isUserComposing = composing;

        // Propagate actual chat state? (if user opted to announce if they are \
        //   composing or not)
        if (this.settings.messages.chats.chatstates !== false) {
          await (room || this.room)?.setUserIsComposing(composing);
        }
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

    debounceDraftAutoSave(): void {
      // Schedule debounce timer? (if none)
      if (this.draftAutoSaveTimeout === null) {
        this.draftAutoSaveTimeout = setTimeout(
          this.fireDraftAutoSave.bind(this),
          DRAFT_AUTOSAVE_DEBOUNCE
        );
      }
    },

    fireDraftAutoSave(force = false, room?: Room): void {
      let maySave = force;

      // Stop debounce timer? (if any)
      if (this.draftAutoSaveTimeout !== null) {
        clearTimeout(this.draftAutoSaveTimeout);

        this.draftAutoSaveTimeout = null;

        // Mark as 'may save' (since there was a scheduled de-bounce timer)
        maySave = true;
      }

      // Proceed saving draft?
      if (maySave === true) {
        (room || this.room)?.saveDraft(this.message);
      }
    },

    async attemptDraftRestore(room?: Room): Promise<void> {
      // Clear message field value
      this.clearMessageField();

      // Load draft
      const draft = await (room || this.room)?.loadDraft();

      // Apply non-empty draft?
      if (draft) {
        this.message = draft;
      }
    },

    insertMessageField(text: string): void {
      // Insert text into message field
      // Notice: prefix with 2 new lines if field is non-empty.
      if (this.message) {
        const newLine = "\n",
          newLineDouble = `${newLine}${newLine}`;

        if (this.message.slice(-newLineDouble.length) === newLineDouble) {
          // Do nothing
        } else if (this.message.slice(-newLine.length) === newLine) {
          // Append 1 new line
          this.message += newLine;
        } else {
          // Append 2 new lines
          this.message += newLineDouble;
        }
      }

      this.message += text;

      // Focus on input
      this.focusMessageField();
    },

    focusMessageField(): void {
      const messageComponent = this.$refs.message as typeof FormField;

      // Can focus immediately?
      if (this.formattingMode === FormattingMode.Write) {
        // Focus on input
        messageComponent?.focusFieldFromParent();
      } else {
        // Force formatting mode back to write
        // Notice: this is important, as the user might be previewing a \
        //   message when something requests to focus on the message field. We \
        //   therefore need to force the mode to write.
        this.formattingMode = FormattingMode.Write;

        // Focus on input
        // Notice: once message field is visible in DOM.
        this.$nextTick(() => {
          messageComponent?.focusFieldFromParent();
        });
      }
    },

    clearMessageField(): void {
      // Clear message field (and its mention query)
      this.message = "";
      this.mentionQuery = null;
    },

    applyMessageFieldFormatting(
      syntax: FormattingSyntax,
      value: string,
      cursor: FieldSelectionCursor
    ): void {
      // Format selected text
      let codeTagIndexStart = 0,
        codeTagIndexEnd = 0,
        cursorFormattedText = "";

      const cursorTextParts =
        syntax.contiguous === true ? [cursor.text] : cursor.text.split("\n");

      cursorTextParts.forEach((textLine: string, index: number) => {
        let formattedPart = "";

        // Populate formatted part basis
        if (index > 0) {
          formattedPart += "\n";
        }

        formattedPart += syntax.code.replaceAll(
          FORMATTING_TAG_INDEX,
          `${index + 1}`
        );

        // Initialize start index? (if none)
        // Notice: this takes into account offset added by inserting a \
        //   possible index.
        if (index === 0) {
          codeTagIndexStart = formattedPart.indexOf(FORMATTING_TAG_TEXT);
        }

        // Apply actual formatting to part
        formattedPart = formattedPart.replaceAll(FORMATTING_TAG_TEXT, textLine);

        // Append formatted part data
        cursorFormattedText += formattedPart;
        codeTagIndexEnd += codeTagIndexStart;
      });

      // Generate new value with formatting
      const formattedValue =
        value.substring(0, cursor.start) +
        cursorFormattedText +
        value.substring(cursor.end);

      // Update message in field
      this.message = formattedValue;

      // Restore focus and selection on the message field
      // Notice: once updated message model has been applied to field.
      this.$nextTick(() => {
        // Restore selection (taking into account changed value)
        (this.$refs.message as typeof FormField)?.selectFieldRangeFromParent(
          cursor.start + codeTagIndexStart,
          cursor.end + codeTagIndexEnd
        );

        // Restore focus on the message field
        this.focusMessageField();
      });
    },

    refreshMessageFieldMentions(message: string): void {
      // Look for mentions to suggest?
      // Notice: only check using the heavier regex if there is at least one \
      //   '@' character found, using a more efficient 'includes()' lookup. \
      //   Also, if the regex returns an empty match, we still consider it as \
      //   an active mention query, since the user might just have entered a \
      //   single '@' to list all users that can be mentioned.
      let matchedMentionQuery = undefined;

      if (message && message.includes("@") === true) {
        matchedMentionQuery = message.match(MESSAGE_TEXT_MENTION_REGEX)?.[1];
      }

      this.mentionQuery =
        matchedMentionQuery !== undefined
          ? matchedMentionQuery.toLowerCase()
          : null;
    },

    appendSuggestionParticipant(
      suggestions: Array<FormFieldSuggestSuggestion>,
      appendRegister: Set<string>,
      jidString: string,
      participantId: ParticipantId | null,
      name: string,
      query: string
    ): void {
      if (appendRegister.has(jidString) === false) {
        const participantName = name.toLowerCase();

        // Participant name matches mention query?
        if (!query || participantName.startsWith(query) === true) {
          // Insert suggestion
          // Important: insert a space after participant name in inner \
          //   value, so that the suggestion list does not pop in again \
          //   after this suggestion is picked by the user.
          suggestions.push({
            label: name,
            value: jidString,

            action: {
              match: `@${query}`,
              replacement: `[@${name}](xmpp:${jidString}) `
            },

            icon: {
              component: BaseAvatar,

              properties: {
                jid: new JID(jidString),
                size: "18px",
                shadow: "none",
                participantId
              }
            }
          });

          appendRegister.add(jidString);
        }
      }
    },

    mayHandleGlobalKeyPress(event: KeyboardEvent): boolean {
      // Notice: this is quite hacky, as we restrict auto-focus on \
      //   single-character keys only, which typically map to a written \
      //   character. We also do not want to process this when a modifier key \
      //   is pressed, since the user does not intend to write text in this \
      //   case. As well, do not change focus state if user has already focus \
      //   on a field.
      const activeTagName = document.activeElement?.tagName || null;

      if (
        this.isMessageFieldFocused !== true &&
        this.session.interface.foreground.mounted !== true &&
        event.key.length === 1 &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        activeTagName !== "INPUT" &&
        activeTagName !== "TEXTAREA"
      ) {
        return true;
      }

      return false;
    },

    // --> EVENT LISTENERS <--

    onActionFormatClick(): void {
      // Toggle formatting toolbar
      Store.$layout.setInboxFormFormatting(
        !this.isActionFormatFormattingVisible
      );

      // Focus on input
      this.focusMessageField();
    },

    onActionRecordClick(): void {
      // Toggle popover
      this.isActionRecordRecorderVisible = !this.isActionRecordRecorderVisible;
    },

    onActionEmojisClick(): void {
      // Toggle popover
      this.isActionEmojisPopoverVisible = !this.isActionEmojisPopoverVisible;
    },

    onActionEmojisPopoverClose(): void {
      // Close popover
      this.isActionEmojisPopoverVisible = false;
    },

    onFormattingAction(
      action: FormattingAction,
      syntax: FormattingSyntax
    ): void {
      this.$log.debug(`Apply formatting to message field: ${action}`);

      // Acquire field selection
      const selection = (
        this.$refs.message as typeof FormField
      )?.acquireFieldSelectionFromParent();

      if (selection?.cursor !== undefined) {
        this.applyMessageFieldFormatting(
          syntax,
          selection.value,
          selection.cursor
        );
      }
    },

    onFormattingMode(mode: FormattingMode): void {
      this.formattingMode = mode;
    },

    onRecorderAudio(audio: RecorderAudio) {
      // Close recorder
      this.isActionRecordRecorderVisible = false;

      // Attach file
      this.onAttachFile(audio.file);
    },

    onRecorderCancel() {
      // Close recorder
      this.isActionRecordRecorderVisible = false;
    },

    onRecorderError() {
      // Close recorder
      this.isActionRecordRecorderVisible = false;

      // Show error
      BaseAlert.error("Failed recording audio", "Did you refuse recording?");
    },

    async onAttachFile(file: File): Promise<void> {
      // Retain target room identifier
      // Notice: if the target room changes while the upload is pending, \
      //   this will ensure that we do not send the message to the wrong \
      //   room.
      const roomId = this.room?.id || null;

      if (roomId !== null) {
        // Acquire upload options
        const uploadOptions =
          this.settings.messages.files.uploads.optimize !== false
            ? UploadOptions.OptimizeAndShrink
            : UploadOptions.NoneSpecified;

        // Acquire slot generator
        const slotGenerator = async (
          file: File
        ): Promise<UploadSlot | void> => {
          return await Broker.$data.requestUploadSlot(
            file.name,
            file.size,
            file.type
          );
        };

        // Queue file for upload
        UtilitiesUpload.addToQueue(roomId, file, uploadOptions, slotGenerator);

        // Start processing queue?
        if (this.isAttachFilePending !== true) {
          try {
            // Mark file attach as pending
            this.isAttachFilePending = true;

            // Process queue (start uploading now, until last item in queue is \
            //   processed)
            const result = await UtilitiesUpload.processQueue(roomId);

            // No files sent?
            if (result.attachments.length === 0) {
              throw new Error("No files were uploaded");
            }

            // Send message (with file attachments)
            let messageRequest = new SendMessageRequest(),
              messageRequestBody = new SendMessageRequestBody();

            messageRequestBody.text =
              result.attachments.length === 1
                ? "Shared 1 file"
                : `Shared ${result.attachments.length} files`;

            messageRequest.body = messageRequestBody;
            messageRequest.attachments = result.attachments;

            await this.room?.sendMessage(messageRequest);

            // Acknowledge that files were sent (partial, or complete)
            if (result.failedFiles.length > 0) {
              BaseAlert.warning(
                "Some files were sent",
                result.failedFiles.length === 1
                  ? "One file could not be sent"
                  : `${result.failedFiles.length} files could not be sent`
              );
            } else {
              BaseAlert.success(
                result.attachments.length === 1
                  ? "File sent"
                  : `All files sent`,
                result.attachments.length === 1
                  ? "Your file was successfully uploaded"
                  : `${result.attachments.length} files were uploaded`
              );
            }
          } catch (error) {
            // Alert of upload error
            this.$log.error(`Could not upload file queue`, error);

            BaseAlert.error(
              "Failed sending a file",
              "It might be too large. Try again?"
            );
          } finally {
            this.isAttachFilePending = false;
          }
        }
      } else {
        BaseAlert.warning(
          "Cannot upload yet",
          "Please wait a bit for things to load"
        );
      }
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
      this.focusMessageField();
    },

    onGlobalKeyPress({ event }: { event: KeyboardEvent }): void {
      // May handle global key press?
      if (this.mayHandleGlobalKeyPress(event) === true) {
        // Intercept this keyboard input
        // Notice: this is required, since browsers such as Safari will not be \
        //   done processing events when focus is requested, therefore the \
        //   event might be dispatched to the now-focused field, resulting in \
        //   a double-dispatch condition, leading to 2 same characters being \
        //   appended to the field. Intercepting the event fixes this issue.
        event.preventDefault();
        event.stopPropagation();

        // Append key value to model
        this.message += event.key;

        // Auto-focus on the message field
        this.focusMessageField();
      }
    },

    onKeyStroke(value: string): void {
      // Check for emoji replacements (eg. ':)' becomes a proper emoji')
      // Notice: for performance reasons, this is only applied on last typed \
      //   word, which needs to be complete (that is, followed with a space).
      const replacedValue =
        this.$filters.string.replaceLastSmileyToEmoji(value);

      if (replacedValue !== null) {
        // Update current value and model
        value = replacedValue;

        this.message = replacedValue;
      }

      // Acquire current chat state
      const isComposing = value.length > 0;

      // Propagate new chat state (as needed)
      this.propagateChatState(isComposing);

      // Schedule next compose timeout and de-bounce draft save?
      if (isComposing === true) {
        this.scheduleChatStateComposeTimeout();
        this.debounceDraftAutoSave();
      } else {
        this.fireDraftAutoSave();
      }

      // Refresh mentions to suggest?
      this.refreshMessageFieldMentions(value);
    },

    onKeyUp(event: KeyboardEvent): void {
      const keyCode = event.keyCode;

      switch (keyCode) {
        // Up
        case keyCodes.up: {
          // Request to edit last message? (if no message was written)
          if (!this.message) {
            this.$emit("request", Request.EditLastMessage);
          }

          break;
        }
      }
    },

    onFocus(focused: boolean): void {
      this.isMessageFieldFocused = focused;
    },

    async onSubmit(): Promise<void> {
      // Handle virtual key stroke (adding a space at the end of the \
      //   message, so that the last smiley gets replaced, if any)
      // Notice: the extra space will be trimmed after that.
      this.onKeyStroke(this.message + " ");

      // Send message
      const message = this.message.trim();

      if (message) {
        // Clear compose chat state timeout (as needed)
        this.unscheduleChatStateComposeTimeout();

        // Mark user as not composing anymore
        this.isUserComposing = false;

        // Send message
        let messageRequest = new SendMessageRequest(),
          messageRequestBody = new SendMessageRequestBody();

        // Generate message body
        messageRequestBody.text = message;

        messageRequest.body = messageRequestBody;

        await this.room?.sendMessage(messageRequest);

        // Clear message field value
        this.clearMessageField();

        // Fire draft auto-save (to new empty message)
        this.fireDraftAutoSave(true);
      }
    },

    onRefresh(): void {
      // Request to preserve scroll position
      this.$emit("request", Request.PreserveScrollPosition);
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
$form-compose-formatting-recess-block: 3px;
$form-compose-field-height-minimum: (
  $size-inbox-form-height - (2 * $form-compose-padding-block)
);

$form-compose-send-position-edges: 6px;
$form-compose-send-button-size: (
  $form-compose-field-height-minimum - (2 * $form-compose-send-position-edges)
);

#{$c} {
  position: relative;

  &:has(#{$c}__actions) {
    align-items: flex-end;
  }

  #{$c}__actions {
    margin-block-end: (
      $form-compose-padding-block + calc($form-compose-field-height-minimum / 2) -
        calc($size-base-action-height / 2)
    );
  }

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

    #{$c}__compose-form {
      position: relative;
    }

    &,
    #{$c}__compose-field {
      width: 100%;
    }

    #{$c}__compose-field textarea,
    #{$c}__compose-preview {
      min-height: $form-compose-field-height-minimum;
      max-height: 220px;
      border-radius: ($size-form-field-border-radius + 2px);
    }

    #{$c}__compose-field {
      textarea {
        padding-inline-end: (
          $form-compose-send-button-size + $form-compose-send-position-edges +
            2px
        );
      }
    }

    #{$c}__compose-send {
      position: absolute;
      inset-block-end: $form-compose-send-position-edges;
      inset-inline-end: $form-compose-send-position-edges;

      #{$c}__compose-send-button {
        width: $form-compose-send-button-size;
        height: $form-compose-send-button-size;
        display: flex;
        align-content: center;
        justify-content: center;
      }

      #{$c}__compose-send-icon {
        fill: rgb(var(--color-white-fixed));
        margin-inline-start: -2px;
      }
    }

    #{$c}__compose-chatstate {
      padding-inline: $size-form-field-large-padding-sides;
      position: absolute;
      inset-inline-start: 0;
      inset-block-end: calc(100% - 5px);
      z-index: 1;

      &--with-formatting {
        inset-block-end: calc(100% - 2px);
      }
    }

    #{$c}__compose-formatting {
      margin-inline: 1px;
      margin-block-start: -$form-compose-formatting-recess-block;
      margin-block-end: (
        $form-compose-padding-block - $form-compose-formatting-recess-block
      );
    }
  }

  #{$c}__loader {
    position: absolute;
    inset-block-end: 100%;
    inset-inline: 0;
    z-index: 0;
  }
}
</style>
