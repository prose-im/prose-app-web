<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "c-tool-avatar-select",
    {
      "c-tool-avatar-select--locked": pending || fileLoading
    }
  ]`
)
  base-avatar(
    :jid="jid"
    :data-url="avatarDataUrl"
    size="96px"
    shadow="light"
    class="c-tool-avatar-select__image"
    square
  )

  span.c-tool-avatar-select__file
    input.c-tool-avatar-select__input(
      @change.prevent="onFileChange",
      :accept="acceptTypes"
      type="file",
      id="avatar_file",
      tabindex="-1"
    )

  label.c-tool-avatar-select__edit(
    for="avatar_file"
  )
    span.c-tool-avatar-select__edit-inner
      span.c-tool-avatar-select__edit-text.u-bold
        | Edit
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";
import Latin1 from "crypto-js/enc-latin1";
import Base64 from "crypto-js/enc-base64";
import { readAndCompressImage } from "browser-image-resizer";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// INTERFACES
export interface Update {
  binary: string;
  base64: string;
  dataUrl: string;
  type: string;
  bytes: number;
}

// CONSTANTS
const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"];
const AVATAR_EXTENSIONS = ["JPG", "PNG", "GIF"];

const AVATAR_CONVERT_MIME = "image/jpeg";
const AVATAR_COMPRESS_QUALITY = 0.94;
const AVATAR_SIZE_MAXIMUM = 400;

export default {
  name: "ToolAvatarSelect",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    pending: {
      type: Boolean,
      default: false
    }
  },

  emits: ["update"],

  data() {
    return {
      // --> STATE <--

      fileLoading: false,

      avatarDataUrl: null as string | null
    };
  },

  computed: {
    acceptTypes(): string {
      return AVATAR_MIME_TYPES.join(",");
    }
  },

  methods: {
    // --> HELPERS <--

    async readFile(avatarFile: File): Promise<Update> {
      // #1. Read and normalize image
      const avatarBlob = await readAndCompressImage(avatarFile, {
        quality: AVATAR_COMPRESS_QUALITY,
        maxWidth: AVATAR_SIZE_MAXIMUM,
        maxHeight: AVATAR_SIZE_MAXIMUM,
        mimeType: AVATAR_CONVERT_MIME
      });

      // #2. Convert image file blob to Base64
      const avatarBinary: string | ArrayBuffer | null = await new Promise(
        resolve => {
          const reader = new FileReader();

          reader.readAsBinaryString(avatarBlob);

          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
        }
      );

      // #3. Ensure that avatar is defined (and return format is 'string')
      if (avatarBinary !== null && typeof avatarBinary === "string") {
        // Acquire avatar data from binary
        const avatarData = Base64.stringify(Latin1.parse(avatarBinary));
        const avatarDataUrl = `data:${avatarBlob.type};base64,${avatarData}`;

        return {
          binary: avatarBinary,
          base64: avatarData,
          dataUrl: avatarDataUrl,
          type: avatarBlob.type,
          bytes: avatarBlob.size
        };
      }

      throw new Error("Could not load avatar");
    },

    // --> EVENT LISTENERS <--

    async onFileChange(event: InputEvent): Promise<void> {
      const target = (event.target as HTMLInputElement) || null;

      if (
        target?.files &&
        target?.files.length > 0 &&
        this.fileLoading !== true
      ) {
        const avatarFile: File = target.files[0];

        if (AVATAR_MIME_TYPES.includes(avatarFile.type) === true) {
          // Mark as loading
          this.fileLoading = true;

          // Acquire avatar data
          try {
            const avatarUpdate = await this.readFile(avatarFile);

            this.avatarDataUrl = avatarUpdate.dataUrl || null;

            this.$emit("update", avatarUpdate);
          } catch (error) {
            this.$log.error("Error loading avatar file", error);

            BaseAlert.warning(
              "Cannot load this file",
              "Image file seems to be empty"
            );
          }

          // Mark as non-loading
          this.fileLoading = false;
        } else {
          BaseAlert.warning(
            "Cannot use this file",
            `Accepted files: ${AVATAR_EXTENSIONS.join(", ")}`
          );
        }
      } else {
        BaseAlert.error("Cannot load avatar", "No file was selected!");
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-tool-avatar-select";

#{$c} {
  line-height: 0;
  text-align: center;
  overflow: hidden;
  display: inline-block;
  position: relative;
  border-radius: 12px;

  &:hover {
    #{$c}__edit {
      #{$c}__edit-inner {
        visibility: visible;
        opacity: 1;
      }
    }
  }

  &:active {
    #{$c}__edit {
      #{$c}__edit-inner {
        #{$c}__edit-text {
          transform: scale(0.96);
        }
      }
    }
  }

  #{$c}__image {
    position: relative;
    z-index: 1;
  }

  #{$c}__file {
    overflow: hidden;
    position: absolute;
    inset: 0;
    z-index: -1;

    #{$c}__input {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      display: block;
      opacity: 0;
    }
  }

  #{$c}__edit {
    cursor: pointer;
    position: absolute;
    inset: 0;
    z-index: 2;

    #{$c}__edit-inner {
      background-image: linear-gradient(
        180deg,
        rgba(var(--color-black), 0) 0%,
        rgba(var(--color-black), 0.6) 100%
      );
      padding-block-start: 14px;
      padding-block-end: 10px;
      position: absolute;
      inset-inline: 0;
      inset-block-end: 0;
      visibility: hidden;
      opacity: 0;
      transition: opacity 100ms linear;

      #{$c}__edit-text {
        color: rgb(var(--color-text-reverse));
        font-size: 12.5px;
        line-height: 14px;
        text-transform: lowercase;
        display: inline-block;
        transition: transform 100ms linear;
      }
    }
  }

  // --> BOOLEANS <--

  &--locked {
    pointer-events: none;
  }
}
</style>
