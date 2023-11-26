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
    ul.p-shared-files__mosaic(
      v-if="sectionFiles.length > 0"
    )
      li.p-shared-files__file(
        v-for="file in sectionFiles"
      )
        a.p-shared-files__thumbnail(
          @click="onThumbnailClick"
        )

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
// NPM
// @ts-expect-error download is a dependency w/o any declaration
import download from "browser-downloads";

// PROJECT: COMPONENTS
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import {
  Collection as FilePreviewCollection,
  FileType as FilePreviewFileType
} from "@/components/inbox/InboxFilePreview.vue";

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

      // TODO: dummy files
      files: Array(6).fill({})
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
    }
  },

  methods: {
    // --> HELPERS <--

    onSectionsNavigate(sectionId: string): void {
      this.section = sectionId;
    },

    // --> EVENT LISTENERS <--

    onThumbnailClick(): void {
      const fileCollection: FilePreviewCollection = [],
        fileIndex = 0;

      let fileDownloadUrl: string | null = null,
        fileDownloadName: string | null = null;

      // TODO: remove this fixture
      switch (this.section) {
        case "images": {
          fileCollection.push({
            type: FilePreviewFileType.Image,
            url: "https://crisp.chat/static/blog/content/images/size/w2000/2023/09/product-update-august-2023.jpeg",
            name: "product-update-august-2023.jpeg"
          });

          break;
        }

        case "videos": {
          fileCollection.push({
            type: FilePreviewFileType.Video,
            url: "https://plugins.crisp.chat/urn:crisp.im:bot:0/config/videos/editor/add_blocks_quick/add_blocks_quick-vp9.webm",
            name: "add_blocks_quick-vp9.webm"
          });

          break;
        }

        case "others": {
          fileDownloadUrl =
            "https://storage.crisp.chat/public/documents/Brand%20Assets.zip";
          fileDownloadName = "Brand Assets.zip";

          break;
        }
      }

      if (fileDownloadUrl !== null) {
        // Download target file
        download(fileDownloadUrl, fileDownloadName || undefined);
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

.p-shared-files {
  #{$c}__content {
    display: flex;
    flex-direction: column;

    #{$c}__overlay {
      flex: 1;
    }
  }

  #{$c}__mosaic {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 14px;

    #{$c}__file {
      #{$c}__thumbnail {
        background-color: rgb(var(--color-background-primary));
        border: 1px solid rgb(var(--color-border-primary));
        aspect-ratio: 1;
        width: 100%;
        display: block;
        border-radius: 6px;
        transition: border-color 100ms linear;

        &:hover {
          border-color: darken-var(var(--color-border-primary), 5%);
        }

        &:active {
          border-color: darken-var(var(--color-border-primary), 8%);
        }
      }
    }
  }
}
</style>
