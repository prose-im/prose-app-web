<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-popup-navigate(
  @close="onClose"
  :content-section="section"
  content-class="p-shared-files__content"
  class="p-shared-files"
)
  template(
    v-slot:navigate
  )
    base-navigate(
      @navigate="onSectionsNavigate"
      :sections="navigateSections"
      :active-id="section"
    )

  template(
    v-slot:content
  )
    ul(
      v-if="sectionFiles.length > 0"
      :class=`[
        "p-shared-files__mosaic",
        {
          "p-shared-files__mosaic--medias": isSectionMedia,
          "p-shared-files__mosaic--downloads": !isSectionMedia
        }
      ]`
    )
      li.p-shared-files__file(
        v-for="file in sectionFiles"
      )
        a.p-shared-files__target(
          @click="onThumbnailClick"
        )
          template(
            v-if="!isSectionMedia"
          )
            base-action(
              class="p-shared-files__action"
              icon="arrow.down.circle.dotted"
              context="grey"
              size="18px"
            )

            span.p-shared-files__name.u-ellipsis
              | {{ file.name }}

    base-overlay(
      v-else
      class="p-shared-files__overlay"
      transparent
    )
      base-placeholder-image(
        :title="emptyTitle"
        illustration="file-not-found"
        description="There are no files of this type just yet"
      )

  template(
    v-slot:actions
  )
    base-popup-actions(
      @cancel="onClose"
      :confirm="false"
      cancel-label="Close"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import { Collection as FilePreviewCollection } from "@/components/inbox/InboxFilePreview.vue";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

// CONSTANTS
const SECTION_INITIAL = "images";

export default {
  name: "SharedFiles",

  emits: ["filePreview", "close"],

  data() {
    return {
      // --> STATE <--

      section: SECTION_INITIAL,

      // --> DATA <--

      navigateSections: [
        {
          id: "images",
          title: "Images",
          icon: "photo.fill"
        },

        {
          id: "videos",
          title: "Videos",
          icon: "movieclapper.fill"
        },

        {
          id: "others",
          title: "Others",
          icon: "archivebox.fill"
        }
      ] as Array<NavigateSection>,

      // TODO: populate from somewhere
      files: []
    };
  },

  computed: {
    sectionFiles(): Array<object> {
      // TODO: filter files based on section
      return this.files;
    },

    emptyTitle(): string {
      const sectionLabel =
        this.section === "others" ? "other files" : this.section;

      return `No ${sectionLabel} shared`;
    },

    isSectionMedia(): boolean {
      switch (this.section) {
        case "images":
        case "videos": {
          return true;
        }

        default: {
          return false;
        }
      }
    }
  },

  methods: {
    // --> HELPERS <--

    onSectionsNavigate(sectionId: string): void {
      this.section = sectionId;
    },

    // --> EVENT LISTENERS <--

    async onThumbnailClick(): Promise<void> {
      const fileCollection: FilePreviewCollection = [],
        fileIndex = 0;

      let fileDownloadUrl: string | null = null,
        fileDownloadName: string | null = null;

      // TODO: add file data

      if (fileDownloadUrl !== null) {
        try {
          // Download target file
          await UtilitiesRuntime.requestFileDownload(
            fileDownloadUrl,
            fileDownloadName
          );

          BaseAlert.info("Shared file saved", "The file has been downloaded");
        } catch (error) {
          this.$log.error(
            `Could not download file from thumbnail at URL: ${fileDownloadUrl}`,
            error
          );

          BaseAlert.error(
            "Failed saving shared file",
            "Could not download. Try again?"
          );
        }
      } else {
        // Preview files
        this.$emit("filePreview", fileCollection, fileIndex);
      }
    },

    onClose(): void {
      this.$emit("close");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-shared-files";

#{$c} {
  #{$c}__content {
    display: flex;
    flex-direction: column;

    #{$c}__overlay {
      flex: 1;
    }
  }

  #{$c}__mosaic {
    #{$c}__file {
      #{$c}__target {
        background-color: rgb(var(--color-background-primary));
        border: 1px solid rgb(var(--color-border-primary));
        outline: 0 solid rgba(var(--color-base-blue-normal), 0.16);
        display: block;
        border-radius: 6px;
        transition: border-color 100ms linear, outline-width 150ms linear;

        &:hover,
        &:active {
          outline-width: 2px;
        }

        &:hover {
          border-color: darken-var(var(--color-base-blue-normal), 8%);
        }

        &:active {
          border-color: darken-var(var(--color-base-blue-normal), 18%);
        }
      }
    }

    &--medias {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-gap: 14px;

      #{$c}__file {
        #{$c}__target {
          width: 100%;
          aspect-ratio: 1;
        }
      }
    }

    &--downloads {
      #{$c}__file {
        margin-block-end: 7px;
        display: block;

        &:last-child {
          margin-block-end: 0;
        }

        #{$c}__target {
          padding: 6px 10px;
          display: flex;
          align-items: center;

          #{$c}__action {
            flex: 0 0 auto;
            margin-inline-end: 8px;
          }

          #{$c}__name {
            color: rgb(var(--color-text-primary));
            font-size: 12.5px;
            line-height: 24px;
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
