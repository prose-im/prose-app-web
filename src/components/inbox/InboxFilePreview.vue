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
  base-foreground(
    v-hotkey="hotkeys"
    class="c-inbox-file-preview"
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
                :icon="fullScreen ? 'arrow.down.right.and.arrow.up.left' : 'arrow.up.left.and.arrow.down.right'"
                context="grey"
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
                context="grey"
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
                context="grey"
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
                :disabled="areActionsDisabled || pendingActions.download"
                icon="arrow.down.circle.dotted"
                context="grey"
                size="18px"
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
            illustration="file-not-found"
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
// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

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

      pendingActions: {
        download: false
      },

      fullScreen: false,

      loading: true,
      error: false
    };
  },

  computed: {
    hotkeys(): { [name: string]: () => void } {
      return {
        esc: this.onHotkeyEscape,
        left: this.onHotkeyLeft,
        right: this.onHotkeyRight,
        f: this.onHotkeyF
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

    async fullScreenEnter(): Promise<void> {
      // Request full screen mode on the media element
      this.fullScreen = await UtilitiesRuntime.requestFullscreenEnter(
        this.$refs.viewer as HTMLElement
      );
    },

    async fullScreenLeave(): Promise<void> {
      // Request to leave full screen mode
      await UtilitiesRuntime.requestFullscreenLeave();

      this.fullScreen = false;
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

    onHotkeyEscape(): void {
      // Trigger close button click event
      this.onButtonCloseClick();
    },

    onHotkeyF(): void {
      // Trigger full screen action click event
      this.onActionFullScreenClick();
    },

    async onActionFullScreenClick(): Promise<void> {
      if (this.hasActionFullScreen === true) {
        if (this.fullScreen !== true) {
          await this.fullScreenEnter();
        } else {
          await this.fullScreenLeave();
        }
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

    async onActionDownloadClick(): Promise<void> {
      if (this.activeFile) {
        try {
          // Mark as downloading
          this.pendingActions.download = true;

          // Trigger a download of the file
          await UtilitiesRuntime.requestFileDownload(
            this.activeFile.url,
            this.activeFile.name
          );

          BaseAlert.info("Media saved", "The media has been downloaded");
        } catch (error) {
          this.$log.error(
            `Could not download file from preview at URL: ` +
              `${this.activeFile.url}`,
            error
          );

          BaseAlert.error(
            "Failed saving media",
            "The media could not be downloaded. Try again?"
          );
        } finally {
          // Reset pending action marker
          this.pendingActions.download = false;
        }
      }
    },

    async onButtonCloseClick(): Promise<void> {
      // Forcibly leave full screen mode? (if active)
      if (this.fullScreen === true) {
        await this.fullScreenLeave();
      }

      // Close file preview
      this.$emit("close");
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

#{$c} {
  padding: 40px 60px;

  #{$c}__inner {
    background-color: rgba(var(--color-white), 0.9);
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
      font-size: $font-size-baseline;
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
