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
    base-banner(
      title="Only latest files are shown"
      description="Load older messages to see more files."
      color="white"
      class="p-shared-files__banner"
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
        v-for="(file, index) in sectionFiles"
      )
        a.p-shared-files__target(
          v-if="isSectionMedia"
          @click="onPreviewClick(sectionFiles, sectionPreviewCollection, index)"
          :style=`{
            backgroundImage: ('url(' + file.previewUrl + ')')
          }`
        )

        a.p-shared-files__target(
          v-else
          @click="onDownloadClick(file)"
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
import { PropType } from "vue";
import { Room } from "@prose-im/prose-sdk-js";
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import {
  Collection as FilePreviewCollection,
  FileType as FilePreviewFileType
} from "@/components/inbox/InboxFilePreview.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

// INTERFACES
interface SharedFile {
  name: string;
  type: string;
  url: string;
  previewUrl?: string;
}

// CONSTANTS
const SECTION_INITIAL = "images";

const SECTION_TYPE_GROUPS = ["image", "video"];

const SECTION_FILE_TYPE: { [type: string]: FilePreviewFileType } = {
  images: FilePreviewFileType.Image,
  videos: FilePreviewFileType.Video
};

export default {
  name: "SharedFiles",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    }
  },

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
      ] as Array<NavigateSection>
    };
  },

  computed: {
    sectionFiles(): Array<SharedFile> {
      const files: Array<SharedFile> = [];

      this.messages.forEach(message => {
        message.files?.forEach(file => {
          const fileGroup = file.type.split("/")[0],
            isFileTypeGroup = SECTION_TYPE_GROUPS.includes(fileGroup);

          if (
            (isFileTypeGroup === false && this.section === "others") ||
            (isFileTypeGroup === true && this.section === `${fileGroup}s`)
          ) {
            files.push({
              name: file.name,
              type: file.type,
              url: file.url,
              previewUrl: file.preview?.url
            });
          }
        });
      });

      return files;
    },

    sectionPreviewCollection(): FilePreviewCollection {
      // Create file collection (only for sections that can be previewed)
      const fileCollection: FilePreviewCollection = [],
        fileType = SECTION_FILE_TYPE[this.section] || null;

      if (fileType !== null) {
        this.sectionFiles.forEach(file => {
          fileCollection.push({
            type: fileType,
            url: file.url,
            name: file.name
          });
        });
      }

      return fileCollection;
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
    },

    messages(): ReturnType<typeof Store.$inbox.getMessages> {
      return this.room ? Store.$inbox.getMessages(this.room.id) : [];
    }
  },

  methods: {
    // --> HELPERS <--

    onSectionsNavigate(sectionId: string): void {
      this.section = sectionId;
    },

    // --> EVENT LISTENERS <--

    async onPreviewClick(
      file: Array<SharedFile>,
      collection: FilePreviewCollection,
      index: number
    ): Promise<void> {
      if (collection[index]) {
        // Preview files
        this.$emit("filePreview", collection, index);
      } else {
        // Trigger fallback download (no such file in collection)
        this.onDownloadClick(file[index]);
      }
    },

    async onDownloadClick(file: SharedFile): Promise<void> {
      try {
        // Download target file
        await UtilitiesRuntime.requestFileDownload(file.url, file.name);

        BaseAlert.info("Shared file saved", "The file has been downloaded");
      } catch (error) {
        this.$log.error(
          `Could not download file from thumbnail at URL: ${file.url}`,
          error
        );

        BaseAlert.error(
          "Failed saving shared file",
          "Could not download. Try again?"
        );
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

  #{$c}__banner {
    margin-block-end: 20px;
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
          background-size: cover;
          background-position: center center;
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
            font-size: ($font-size-baseline - 1.5px);
            line-height: 24px;
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
