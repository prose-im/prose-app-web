<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
teleport(
  to="#app"
)
  .c-inbox-file-preview(
    v-hotkey="hotkeys"
  )
    .c-inbox-file-preview__inner
      layout-toolbar(
        class="c-inbox-file-preview__header"
      )
        template(
          v-slot:left
        )
          layout-actions
            base-tooltip(
              align="left"
              direction="bottom"
              tooltip="Enter Full Screen"
            )
              base-action(
                @click="onActionFullScreenClick"
                :disabled="areActionsDisabled || !hasActionFullScreen"
                icon="arrow.up.left.and.arrow.down.right"
                size="12px"
              )

            base-tooltip(
              align="left"
              direction="bottom"
              tooltip="Go to Previous"
            )
              base-action(
                @click="onActionNavigatePreviousClick"
                :disabled="areActionsDisabled || !hasActionNavigatePrevious"
                icon="chevron.left"
                size="12px"
              )

            base-tooltip(
              align="left"
              direction="bottom"
              tooltip="Go to Next"
            )
              base-action(
                @click="onActionNavigateNextClick"
                :disabled="areActionsDisabled || !hasActionNavigateNext"
                icon="chevron.right"
                size="12px"
              )

        template(
          v-slot:middle
        )
          p.c-inbox-file-preview__title.u-medium(
            v-if="activeFile"
          )
            | {{ activeFile.name }}

        template(
          v-slot:right
        )
          layout-actions
            base-tooltip(
              align="right"
              direction="bottom"
              tooltip="Download File"
            )
              base-action(
                @click="onActionDownloadClick"
                :disabled="areActionsDisabled"
                icon="arrow.down.circle.dotted"
                size="18px"
              )

            base-tooltip(
              align="right"
              direction="bottom"
              tooltip="Share File"
            )
              base-action(
                @click="onActionShareClick"
                :disabled="areActionsDisabled || true"
                icon="square.and.arrow.up"
                size="20px"
              )

          base-button(
            @click="onButtonCloseClick"
            tint="light"
            size="mid-medium"
            class="c-inbox-file-preview__button"
          )
            | Close

      .c-inbox-file-preview__media(
        @dblclick="onMediaDoubleClick"
      )
        base-overlay(
          v-if="loading || error"
          class="c-inbox-file-preview__overlay"
        )
          base-spinner(
            v-if="loading"
            size="16px"
            border-width="2.5px"
          )

          base-placeholder-image(
            v-else-if="error"
            illustration="welcome"
            title="Could not load file!"
            description="This file might have been removed. Could you maybe try again?"
          )

        template(
          v-if="activeFile"
        )
          img(
            v-if="activeFile.type === 'image'"
            @load="onMediaLoad(activeFile.url)"
            @error="onMediaError(activeFile.url)"
            :src="activeFile.url"
            ref="viewer"
            alt=""
            class="c-inbox-file-preview__viewer c-inbox-file-preview__viewer--image"
          )

          video(
            v-else-if="activeFile.type === 'video'"
            @loadeddata="onMediaLoad(activeFile.url)"
            @error="onMediaError(activeFile.url)"
            :src="activeFile.url"
            ref="viewer"
            class="c-inbox-file-preview__viewer c-inbox-file-preview__viewer--video"
            autoplay
            controls
          )

          audio(
            v-else-if="activeFile.type === 'audio'"
            @loadeddata="onMediaLoad(activeFile.url)"
            @error="onMediaError(activeFile.url)"
            :src="activeFile.url"
            ref="viewer"
            class="c-inbox-file-preview__viewer c-inbox-file-preview__viewer--audio"
            autoplay
            controls
          )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import download from "browser-downloads";

// ENUMERATIONS
export enum FileType {
  // Image type.
  Image = "image",
  // Video type.
  Video = "video",
  // Audio type.
  Audio = "audio"
}

// TYPES
export type Collection = Array<File>;

// INTERFACES
export interface File {
  type: FileType;
  url: string;
  name: string;
}

export default {
  name: "InboxFilePreview",

  props: {
    collection: {
      type: Array,
      required: true,

      validator(x: Collection) {
        return x.length > 0;
      }
    },

    initialIndex: {
      type: Number,
      default: 0
    }
  },

  emits: ["close"],

  data() {
    return {
      // --> DATA <--

      actionIconSize: "13px",

      // --> STATE <--

      activeIndex: this.initialIndex,

      loading: true,
      error: false
    };
  },

  computed: {
    hotkeys() {
      return {
        esc: this.onHotkeyEscape,
        left: this.onHotkeyLeft,
        right: this.onHotkeyRight
      };
    },

    activeFile(): File | void {
      return (this.collection as Collection)[this.activeIndex];
    },

    areActionsDisabled(): boolean {
      return !this.activeFile ? true : false;
    },

    hasActionFullScreen(): boolean {
      switch (this.activeFile?.type) {
        case FileType.Image:
        case FileType.Video: {
          return true;
        }

        default: {
          return false;
        }
      }
    },

    hasActionNavigatePrevious(): boolean {
      return this.activeIndex > 0 ? true : false;
    },

    hasActionNavigateNext(): boolean {
      return this.activeIndex + 1 < this.collection.length ? true : false;
    }
  },

  methods: {
    // --> HELPERS <--

    markLoading(): void {
      // Mark as loading and reset error
      this.loading = true;
      this.error = false;
    },

    // --> EVENT LISTENERS <--

    onHotkeyLeft(): void {
      // Trigger navigate previous action click event
      this.onActionNavigatePreviousClick();
    },

    onHotkeyRight(): void {
      // Trigger navigate next action click event
      this.onActionNavigateNextClick();
    },

    onActionFullScreenClick(): void {
      if (this.hasActionFullScreen === true) {
        // Request full screen mode on the media element
        (this.$refs.viewer as HTMLElement).requestFullscreen();
      }
    },

    onActionNavigatePreviousClick(): void {
      if (this.hasActionNavigatePrevious === true) {
        this.activeIndex -= 1;

        this.markLoading();
      }
    },

    onActionNavigateNextClick(): void {
      if (this.hasActionNavigateNext === true) {
        this.activeIndex += 1;

        this.markLoading();
      }
    },

    onActionDownloadClick(): void {
      if (this.activeFile) {
        // Trigger a browser download of the file
        download(this.activeFile.url, this.activeFile.name);
      }
    },

    onActionShareClick(): void {
      // TODO: not implemented yet
    },

    onButtonCloseClick(): void {
      this.$emit("close");
    },

    onHotkeyEscape(): void {
      // Trigger close button click event
      this.onButtonCloseClick();
    },

    onMediaDoubleClick(): void {
      if (document.fullscreenElement) {
        // Exit full screen mode
        document.exitFullscreen();
      } else {
        // Trigger full screen action click event
        this.onActionFullScreenClick();
      }
    },

    onMediaLoad(url: string): void {
      if (url === this.activeFile?.url) {
        this.loading = false;
        this.error = false;
      }
    },

    onMediaError(url: string): void {
      if (url === this.activeFile?.url) {
        this.loading = false;
        this.error = true;
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-file-preview";

// VARIABLES
$file-preview-border-radius: 9px;

.c-inbox-file-preview {
  background-color: transparent;
  padding: 40px 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  z-index: $index-foreground-secondary;

  #{$c}__inner {
    background-color: rgba(var(--color-white), 0.8);
    border: 1px solid rgb(var(--color-border-tertiary));
    backdrop-filter: blur(8px);
    width: 100%;
    height: 100%;
    padding: 7px;
    display: flex;
    flex-direction: column;
    border-radius: $file-preview-border-radius;
    box-shadow: 0 4px 24px 0 rgba(var(--color-shadow-primary), 0.075);
  }

  #{$c}__header {
    margin-block-end: 6px;
    padding-block: 2px;

    #{$c}__title {
      color: rgb(var(--color-text-primary));
      font-size: 14px;
    }

    #{$c}__button {
      margin-inline-start: 30px;
    }
  }

  #{$c}__media {
    background-color: rgb(var(--color-white));
    border: 1px solid rgb(var(--color-border-secondary));
    flex: 1;
    overflow: hidden;
    position: relative;
    border-radius: ($file-preview-border-radius - 2px);

    #{$c}__overlay {
      position: absolute;
      inset: 0;
    }

    #{$c}__viewer {
      width: 100%;
      height: 100%;

      &--image,
      &--video {
        object-fit: contain;
        object-position: center;
      }
    }
  }
}
</style>
