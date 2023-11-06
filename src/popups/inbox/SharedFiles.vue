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
    ul.p-shared-files__mosaic
      li.p-shared-files__file(
        v-for="file in sectionFiles"
      )
        a.p-shared-files__thumbnail

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
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";

// CONSTANTS
const SECTION_INITIAL = "images";

export default {
  name: "SharedFiles",

  emits: ["close"],

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
          id: "audios",
          title: "Audios",
          icon: "waveform"
        },

        {
          id: "others",
          title: "Others",
          icon: "archivebox.fill"
        }
      ] as Array<NavigateSection>,

      // TODO: dummy files
      files: [{}, {}, {}, {}, {}, {}, {}, {}, {}]
    };
  },

  computed: {
    sectionFiles(): Array<object> {
      // TODO: filter files based on section
      return this.files;
    }
  },

  methods: {
    // --> HELPERS <--

    onSectionsNavigate(sectionId: string): void {
      this.section = sectionId;
    },

    // --> EVENT LISTENERS <--

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
