'
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
      base-tooltip(
        :bypassed="isActionFormattingPopoverVisible"
        align="left"
        tooltip="Text Formatting"
      )
        base-action(
          @click="onActionFormattingClick"
          :active="isActionFormattingPopoverVisible"
          :disabled="isFormDisabled"
          :size="actionIconSize"
          class="a-inbox-form__action"
          icon="textformat.alt"
        )
          base-popover(
            v-if="isActionFormattingPopoverVisible"
            v-click-away="onActionFormattingPopoverClickAway"
            class="a-inbox-form__action-popover a-inbox-form__action-popover--left"
          )
            inbox-form-formatting(
              @action="onFormattingAction"
              class="a-inbox-form__action-formatting"
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
    form.a-inbox-form__compose(
      @submit.prevent="onSubmit"
    )
      inbox-form-chatstate(
        v-if="room"
        :room="room"
        class="a-inbox-form__compose-chatstate"
      )

      .a-inbox-form__compose-inner
        form-field(
          v-model="message"
          @keystroke="onKeystroke"
          @submit="onSubmit"
          :suggestions="fieldSuggestions"
          :disabled="isFormDisabled"
          :rows="1"
          :placeholder="fieldComposePlaceholder"
          class="a-inbox-form__compose-field"
          type="textarea"
          name="message"
          size="large"
          align="left"
          direction="top"
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
      base-tooltip(
        align="right"
        tooltip="Send Files"
      )
        base-action(
          @click="onActionAttachClick"
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
            v-click-away="onActionEmojisPopoverClickAway"
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
  Room,
  RoomID,
  RoomType,
  ParticipantInfo,
  SendMessageRequest,
  Attachment,
  UploadHeader
} from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import BaseAvatar from "@/components/base/BaseAvatar.vue";
import FormField from "@/components/form/FormField.vue";
import { Suggestion as FormFieldSuggestSuggestion } from "@/components/form/FormFieldSuggest.vue";
import {
  default as InboxFormFormatting,
  FormattingAction
} from "@/components/inbox/InboxFormFormatting.vue";
import {
  default as InboxFormRecorder,
  Audio as RecorderAudio
} from "@/components/inbox/InboxFormRecorder.vue";
import InboxFormAttach from "@/components/inbox/InboxFormAttach.vue";
import InboxFormChatstate from "@/components/inbox/InboxFormChatstate.vue";
import InboxFormLoader from "@/components/inbox/InboxFormLoader.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// INTERFACES
interface BatchFileUploadResult {
  attachments: Array<Attachment>;
  failedFiles: Array<File>;
}

// INSTANCES
const MESSAGE_MENTION_REGEX = /(?:^|\s)@([^@\s]{0,80})$/;

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
    InboxFormLoader
  },

  props: {
    room: {
      type: Object as PropType<Room>,
      default: undefined
    }
  },

  data() {
    return {
      // --> DATA <--

      actionIconSize: "18px",

      // --> STATE <--

      message: "",

      mentionQuery: null as string | null,

      isActionFormattingPopoverVisible: false,
      isActionRecordRecorderVisible: false,
      isActionEmojisPopoverVisible: false,

      isUserComposing: false,
      isAttachFilePending: false,

      fileUploadQueue: {} as { [roomId: RoomID]: Array<File> },

      chatStateComposeTimeout: null as null | ReturnType<typeof setTimeout>,
      draftAutoSaveTimeout: null as null | ReturnType<typeof setTimeout>
    };
  },

  computed: {
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
        const mentionQuery = this.mentionQuery;

        // Append matches from room participants
        this.room?.participants.forEach(participant => {
          this.appendSuggestionParticipant(
            suggestions,
            participant,
            mentionQuery
          );
        });
      }

      return suggestions;
    },

    isFormDisabled(): boolean {
      return !this.session.connected ? true : false;
    },

    session(): typeof Store.$session {
      return Store.$session;
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

        // Load draft for new room?
        if (newValue && (!oldValue || newValue.id !== oldValue.id)) {
          this.attemptDraftRestore(newValue);
        }
      }
    }
  },

  beforeUnmount() {
    // Clear registered timeouts
    this.unscheduleChatStateComposeTimeout();
    this.fireDraftAutoSave();
  },

  methods: {
    // --> HELPERS <--

    async propagateChatState(composing: boolean, room?: Room): Promise<void> {
      // Clear compose chat state timeout (as needed)
      this.unscheduleChatStateComposeTimeout();

      // Propagate new chat state?
      if (composing !== this.isUserComposing) {
        this.isUserComposing = composing;

        await (room || this.room)?.setUserIsComposing(composing);
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

    clearMessageField(): void {
      // Clear message field (and its mention query)
      this.message = "";
      this.mentionQuery = null;
    },

    appendSuggestionParticipant(
      suggestions: Array<FormFieldSuggestSuggestion>,
      participant: ParticipantInfo,
      query: string
    ): void {
      if (participant.jid) {
        const participantName = participant.name.toLowerCase();

        // Participant name matches mention query?
        if (!query || participantName.startsWith(query) === true) {
          // Insert suggestion
          // Important: insert a space after participant name in inner \
          //   value, so that the suggestion list does not pop in again \
          //   after this suggestion is picked by the user.
          suggestions.push({
            label: participant.name,
            value: participant.jid.toString(),

            action: {
              match: query,
              replacement: `${participant.name} `
            },

            icon: {
              component: BaseAvatar,

              properties: {
                jid: participant.jid,
                size: "18px",
                shadow: "none"
              }
            }
          });
        }
      }
    },

    queueFileForUpload(roomId: RoomID, file: File): void {
      // Assign queue register for room?
      if (!(roomId in this.fileUploadQueue)) {
        this.fileUploadQueue[roomId] = [];
      }

      // Append file to upload queue for room
      this.fileUploadQueue[roomId].push(file);
    },

    async processQueuedFileUploads(
      roomId: RoomID
    ): Promise<BatchFileUploadResult> {
      const result: BatchFileUploadResult = {
        attachments: [],
        failedFiles: []
      };

      // Upload next queued file
      // Notice: this recurses until there are no files pending in the queue, \
      //   this also does not error out in any case, so that upload errors do \
      //   not block next upload.
      await this.processNextQueuedFileUpload(roomId, result);

      return result;
    },

    async processNextQueuedFileUpload(
      roomId: RoomID,
      result: BatchFileUploadResult
    ): Promise<void> {
      const currentFile = (this.fileUploadQueue[roomId] || []).shift() || null;

      // Current file found in queue?
      if (currentFile !== null) {
        this.$log.debug(
          `Uploading next file in queue: '${currentFile.name}'...`
        );

        try {
          // Upload current file
          const attachment = await this.processQueuedFileUpload(currentFile);

          this.$log.info(`Uploaded next file in queue: '${currentFile.name}'`);

          // Append uploaded file to success stack
          result.attachments.push(attachment);
        } catch (error) {
          this.$log.error(
            `Could not upload next file in queue: '${currentFile.name}'`,
            error
          );

          // Append non-uploaded file to success stack
          result.failedFiles.push(currentFile);
        } finally {
          // Process next file in queue (if any)
          await this.processNextQueuedFileUpload(roomId, result);
        }
      } else {
        this.$log.debug("Reached end of files queued for upload");

        // Unassign queue register for room
        delete this.fileUploadQueue[roomId];
      }
    },

    async processQueuedFileUpload(file: File): Promise<Attachment> {
      // Request file upload slot
      const slot = await Broker.$data.requestUploadSlot(file.name, file.size);

      if (!slot) {
        throw new Error("Could not obtain an upload slot");
      }

      // Generate file upload request headers
      const requestHeaders: { [name: string]: string } = {
        "Content-Length": `${file.size}`,
        "Content-Type": file.type
      };

      slot.uploadHeaders.forEach((header: UploadHeader) => {
        requestHeaders[header.name] = header.value;
      });

      // Upload file
      await fetch(slot.uploadURL, {
        body: file,
        mode: "cors",
        method: "PUT",
        headers: requestHeaders
      });

      // Generate attachment
      const attachment = new Attachment(slot.downloadURL);

      attachment.description = file.name;

      return attachment;
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

    onActionRecordClick(): void {
      // Toggle popover
      this.isActionRecordRecorderVisible = !this.isActionRecordRecorderVisible;
    },

    onActionAttachClick(): void {
      // TODO: open file picker
    },

    onActionEmojisClick(): void {
      // Toggle popover
      this.isActionEmojisPopoverVisible = !this.isActionEmojisPopoverVisible;
    },

    onActionEmojisPopoverClickAway(): void {
      // Close popover
      this.isActionEmojisPopoverVisible = false;
    },

    onFormattingAction(action: FormattingAction): void {
      // Close popover
      this.isActionFormattingPopoverVisible = false;

      // TODO: apply formatting to text
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
      // TODO: send optional image size for images (need a XEP for that)
      // TODO: send optional audio duration for audios (need a XEP for that)
      // TODO: find a way to pass MIME type for all uploads (not possible w/ \
      //   OOB?)

      // Retain target room identifier
      // Notice: if the target room changes while the upload is pending, \
      //   this will ensure that we do not send the message to the wrong \
      //   room.
      const roomId = this.room?.id || null;

      if (roomId !== null) {
        // Queue file for upload
        this.queueFileForUpload(roomId, file);

        // Start processing queue?
        if (this.isAttachFilePending !== true) {
          try {
            // Mark file attach as pending
            this.isAttachFilePending = true;

            // Process queue (start uploading now, until last item in queue is \
            //   processed)
            const result = await this.processQueuedFileUploads(roomId);

            // No files sent?
            if (result.attachments.length === 0) {
              throw new Error("No files were uploaded");
            }

            // Send message (with file attachments)
            let messageRequest = new SendMessageRequest();

            messageRequest.body =
              result.attachments.length === 1
                ? "Shared 1 file"
                : `Shared ${result.attachments.length} files`;

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

            BaseAlert.error("Failed sending a file", "Try this again?");
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
      (this.$refs.message as typeof FormField).focusField();
    },

    onKeystroke(value: string): void {
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

      // Look for mentions to suggest?
      // Notice: only check using the heavier regex if there is at least one \
      //   '@' character found, using a more efficient 'includes()' lookup. \
      //   Also, if the regex returns an empty match, we still consider it as \
      //   an active mention query, since the user might just have entered a \
      //   single '@' to list all users that can be mentioned.
      let matchedMentionQuery = undefined;

      if (value && value.includes("@") === true) {
        matchedMentionQuery = value.match(MESSAGE_MENTION_REGEX)?.[1];
      }

      this.mentionQuery =
        matchedMentionQuery !== undefined
          ? matchedMentionQuery.toLowerCase()
          : null;
    },

    async onSubmit(): Promise<void> {
      const message = this.message.trim();

      if (message) {
        // Clear compose chat state timeout (as needed)
        this.unscheduleChatStateComposeTimeout();

        // Mark user as not composing anymore
        this.isUserComposing = false;

        // Invite users to room?
        if (message.startsWith("/invite ") === true) {
          const jid = new JID(message.substring("/invite ".length).trim());

          switch (this.room?.type) {
            case RoomType.DirectMessage:
            case RoomType.Group:
            case RoomType.Generic:
              this.$log.warn("This room type does not allow inviting users");

              break;

            case RoomType.PrivateChannel:
            case RoomType.PublicChannel:
              this.$log.info(`Inviting user ${jid} to room ${this.room.id}`);

              await this.room.inviteUsers([jid.toString()]);

              break;
          }
        } else {
          // Send message
          let messageRequest = new SendMessageRequest();

          messageRequest.body = message;

          await this.room?.sendMessage(messageRequest);
        }

        // Clear message field value
        this.clearMessageField();

        // Fire draft auto-save (to new empty message)
        this.fireDraftAutoSave(true);
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

#{$c} {
  position: relative;

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

    #{$c}__action-formatting {
      min-width: 210px;
      padding-block: 4px;
      padding-inline: 14px;
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

  #{$c}__loader {
    position: absolute;
    inset-block-end: 100%;
    inset-inline: 0;
    z-index: 0;
  }
}
</style>
