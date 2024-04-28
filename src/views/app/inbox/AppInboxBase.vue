<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-view(
  :topbar-component="topbarComponent"
  :topbar-properties="{ jid, room }"
  class="v-app-inbox-base"
)
  .v-app-inbox-base__messages(
    @dragover.prevent.stop="onMessagesDragOver"
    @dragleave.prevent.stop="onMessagesDragLeave"
  )
    inbox-file-preview(
      v-if="filePreview.collection.length > 0"
      @close="onMessagesFilePreviewClose"
      :collection="filePreview.collection"
      :initial-index="filePreview.index"
    )

    inbox-dropzone(
      v-if="isMessagesDragged"
      @drop.prevent.stop="onMessagesDrop"
      :room="room"
      class="v-app-inbox-base__dropzone"
    )

    inbox-banner(
      :jid="jid"
      :room="room"
    )

    inbox-messaging(
      @file-preview="onMessagesFilePreview"
      @dragover="onMessagesDragOver"
      :room="room"
      ref="messaging"
      class="v-app-inbox-base__timeline"
    )

    inbox-form(
      :room="room"
      @request="onMessagesFormRequest"
      ref="form"
      class="v-app-inbox-base__form"
    )

  inbox-details(
    v-if="layout.inbox.details.visible"
    @file-preview="onDetailsFilePreview"
    :jid="jid"
    :room="room"
    class="v-app-inbox-base__details"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";
import { JID, Room, RoomID } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import {
  default as InboxFilePreview,
  Collection as FilePreviewCollection
} from "@/components/inbox/InboxFilePreview.vue";
import InboxDropzone from "@/components/inbox/InboxDropzone.vue";
import InboxBanner from "@/components/inbox/InboxBanner.vue";

// PROJECT: ASSEMBLIES
import {
  default as InboxForm,
  Request as FormRequest
} from "@/assemblies/inbox/InboxForm.vue";
import InboxMessaging from "@/assemblies/inbox/InboxMessaging.vue";
import InboxTopbar from "@/assemblies/inbox/InboxTopbar.vue";
import InboxDetails from "@/assemblies/inbox/InboxDetails.vue";

// PROJECT: UTILITIES
import UtilitiesTitle from "@/utilities/title";

// CONSTANTS
const LAST_ROOM_UPDATE_DELAY = 3000; // 3 seconds

export default {
  name: "AppInboxBase",

  components: {
    InboxFilePreview,
    InboxDropzone,
    InboxMessaging,
    InboxBanner,
    InboxDetails,
    InboxForm
  },

  data() {
    return {
      // --> STATE <--

      filePreview: {
        collection: [] as FilePreviewCollection,
        index: 0
      },

      lastRoomUpdateTimeout: null as null | ReturnType<typeof setTimeout>,

      isMessagesDragged: false,

      // --> DATA <--

      topbarComponent: shallowRef(InboxTopbar)
    };
  },

  computed: {
    jid(): JID {
      return new JID(this.roomId as string);
    },

    roomId(): RoomID {
      return this.$route.params.roomId as RoomID;
    },

    room(): Room | void {
      return Store.$room.getRoom(this.roomId);
    },

    layout(): typeof Store.$layout {
      return Store.$layout;
    }
  },

  watch: {
    room: {
      immediate: true,

      handler(newValue: Room, oldValue: Room) {
        if (newValue && (!oldValue || newValue.id !== oldValue.id)) {
          // Update current title (to room name)
          UtilitiesTitle.update(newValue.name);

          // Update stored last room
          this.updateLastRoom(newValue.id);
        }
      }
    }
  },

  beforeUnmount() {
    // Cancel any pending room update
    this.updateLastRoom();
  },

  methods: {
    // --> EVENT LISTENERS <--

    onMessagesDragOver(): void {
      this.isMessagesDragged = true;
    },

    onMessagesDragLeave(): void {
      this.isMessagesDragged = false;
    },

    onMessagesDrop(event: DragEvent): void {
      this.isMessagesDragged = false;

      // Send dropped files? (if any)
      if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        for (const file of event.dataTransfer.files) {
          (this.$refs.form as typeof InboxForm).attachFileFromParent(file);
        }
      }
    },

    onMessagesFormRequest(request: FormRequest): void {
      // Handle request, and propagate to receiver child
      switch (request) {
        case FormRequest.EditLastMessage: {
          (this.$refs.messaging as typeof InboxMessaging).editLastFromParent();

          break;
        }
      }
    },

    onMessagesFilePreview(collection: FilePreviewCollection, index = 0): void {
      this.filePreview.collection = collection;
      this.filePreview.index = index;
    },

    onMessagesFilePreviewClose(): void {
      this.filePreview.collection = [];
    },

    onDetailsFilePreview(collection: FilePreviewCollection, index = 0): void {
      this.onMessagesFilePreview(collection, index);
    },

    // --> HELPERS <--

    updateLastRoom(roomId?: RoomID): void {
      // Cancel existing timer? (if any)
      if (this.lastRoomUpdateTimeout !== null) {
        clearTimeout(this.lastRoomUpdateTimeout);

        this.lastRoomUpdateTimeout = null;
      }

      // Save new room identifier? (if any, ie. not a schedule reset)
      if (
        roomId !== undefined &&
        roomId !== Store.$navigation.inbox.lastRoomId
      ) {
        this.lastRoomUpdateTimeout = setTimeout(() => {
          this.lastRoomUpdateTimeout = null;

          Store.$navigation.setInboxLastRoomId(roomId);
        }, LAST_ROOM_UPDATE_DELAY);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-inbox-base";

#{$c} {
  #{$c}__messages {
    display: flex;
    flex: 1;
    flex-direction: column;
    position: relative;

    #{$c}__banner {
      padding-inline: ($size-layout-view-content-padding-sides + 11px);
      flex: 0 0 auto;
    }

    #{$c}__dropzone {
      position: absolute;
      inset: 0;
      z-index: 1;
    }

    #{$c}__timeline {
      width: 100%;
      height: 100%;
      flex: 1;
      position: relative;

      &:before,
      &:after {
        content: "";
        height: $size-common-gradient-height;
        position: absolute;
        inset-inline: 0;
        pointer-events: none;
      }

      &:before {
        background-image: linear-gradient(
          0deg,
          rgba(var(--color-black), 0) 0%,
          rgba(var(--color-black), 0.015) 100%
        );
        inset-block-start: 0;
      }

      &:after {
        background-image: linear-gradient(
          180deg,
          rgba(var(--color-black), 0) 0%,
          rgba(var(--color-black), 0.01) 100%
        );
        inset-block-end: 0;
      }
    }

    #{$c}__form {
      border-block-start: 1px solid rgb(var(--color-border-secondary));
      min-height: $size-inbox-form-height;
      padding: 0 $size-layout-view-content-padding-sides;
      flex: 0 0 auto;
    }
  }

  #{$c}__details {
    border-inline-start: 1px solid rgb(var(--color-border-secondary));
    width: $size-inbox-details-width;
    overflow-x: hidden;
    overflow-y: auto;
    flex: 0 0 auto;
  }
}
</style>
