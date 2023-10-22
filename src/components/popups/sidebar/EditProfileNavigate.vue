<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-edit-profile-navigate
  .p-edit-profile-navigate__identity
    div(
      :class=`[
        "p-edit-profile-navigate__identity-avatar",
        {
          "p-edit-profile-navigate__identity-avatar--locked": pending || avatarFileLoading
        }
      ]`
    )
      base-avatar(
        :jid="jid"
        :data-url="avatarUpdate ? avatarUpdate.dataUrl : null"
        size="96px"
        shadow="light"
        class="p-edit-profile-navigate__identity-avatar-image"
        square
      )

      span.p-edit-profile-navigate__identity-avatar-file
        input.p-edit-profile-navigate__identity-avatar-input(
          @change.prevent="onAvatarFileChange",
          :accept="avatarAcceptTypes"
          type="file",
          id="avatar_file",
          tabindex="-1"
        )

      label.p-edit-profile-navigate__identity-avatar-edit(
        for="avatar_file"
      )
        span.p-edit-profile-navigate__identity-avatar-edit-inner
          span.p-edit-profile-navigate__identity-avatar-edit-text.u-bold
            | Edit

    p.p-edit-profile-navigate__identity-name.u-medium
      template(
        v-if="profile.name"
      )
        | {{ profile.name.first }} {{ profile.name.last }}

      template(
        v-else
      )
        | {{ jid.local }}

    p.p-edit-profile-navigate__identity-address
      | {{ jid }}

  base-navigate(
    @navigate="onSectionsNavigate"
    :sections="sections"
    :active-id="section"
    class="p-edit-profile-navigate__sections"
  )
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
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";

// PROJECT: STORES
import Store from "@/store";

// INTERFACES
export interface StateAvatarUpdate {
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
  name: "EditProfileEncryptionDeviceOther",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    sections: {
      type: Array<NavigateSection>,
      required: true,

      validator(x: Array<NavigateSection>): boolean {
        return x.length > 0;
      }
    },

    sectionInitial: {
      type: String,
      default: null
    },

    pending: {
      type: Boolean,
      default: false
    }
  },

  emits: ["navigate", "avatar"],

  data() {
    return {
      // --> STATE <--

      section: this.sectionInitial || null,

      avatarFileLoading: false,
      avatarUpdate: null as StateAvatarUpdate | null
    };
  },

  computed: {
    avatarAcceptTypes(): string {
      return AVATAR_MIME_TYPES.join(",");
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    }
  },

  methods: {
    // --> HELPERS <--

    async readAvatarFile(avatarFile: File): Promise<StateAvatarUpdate> {
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

    async onAvatarFileChange(event: InputEvent): Promise<void> {
      const target = (event.target as HTMLInputElement) || null;

      if (
        target?.files &&
        target?.files.length > 0 &&
        this.avatarFileLoading !== true
      ) {
        const avatarFile: File = target.files[0];

        if (AVATAR_MIME_TYPES.includes(avatarFile.type) === true) {
          // Mark as loading
          this.avatarFileLoading = true;

          // Acquire avatar data
          try {
            const avatarUpdate = await this.readAvatarFile(avatarFile);

            this.$emit("avatar", avatarUpdate);

            this.avatarUpdate = avatarUpdate;

            BaseAlert.info("Avatar changed", "Save your profile to submit it!");
          } catch (error) {
            this.$log.error("Error loading avatar file", error);

            BaseAlert.warning(
              "Cannot load this file",
              "Image file seems to be empty"
            );
          }

          // Mark as non-loading
          this.avatarFileLoading = false;
        } else {
          BaseAlert.warning(
            "Cannot use this file",
            `Accepted files: ${AVATAR_EXTENSIONS.join(", ")}`
          );
        }
      } else {
        BaseAlert.error("Cannot load avatar", "No file was selected!");
      }
    },

    onSectionsNavigate(sectionId: string): void {
      this.section = sectionId;

      this.$emit("navigate", sectionId);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-edit-profile-navigate";

.p-edit-profile-navigate {
  #{$c}__identity {
    text-align: center;

    #{$c}__identity-avatar {
      line-height: 0;
      overflow: hidden;
      display: inline-block;
      position: relative;
      border-radius: 12px;

      &:hover {
        #{$c}__identity-avatar-edit {
          #{$c}__identity-avatar-edit-inner {
            visibility: visible;
            opacity: 1;
          }
        }
      }

      &:active {
        #{$c}__identity-avatar-edit {
          #{$c}__identity-avatar-edit-inner {
            #{$c}__identity-avatar-edit-text {
              transform: scale(0.96);
            }
          }
        }
      }

      &--locked {
        pointer-events: none;
      }

      #{$c}__identity-avatar-image {
        position: relative;
        z-index: 1;
      }

      #{$c}__identity-avatar-file {
        overflow: hidden;
        position: absolute;
        inset: 0;
        z-index: -1;

        #{$c}__identity-avatar-input {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          display: block;
          opacity: 0;
        }
      }

      #{$c}__identity-avatar-edit {
        cursor: pointer;
        position: absolute;
        inset: 0;
        z-index: 2;

        #{$c}__identity-avatar-edit-inner {
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

          #{$c}__identity-avatar-edit-text {
            color: rgb(var(--color-text-reverse));
            font-size: 12.5px;
            line-height: 14px;
            text-transform: lowercase;
            display: inline-block;
            transition: transform 100ms linear;
          }
        }
      }
    }

    #{$c}__identity-name {
      color: rgb(var(--color-text-primary));
      font-size: 15.5px;
      margin-block-start: 14px;
    }

    #{$c}__identity-address {
      color: rgb(var(--color-text-secondary));
      font-size: 13.5px;
      margin-block-start: 4px;
    }
  }

  #{$c}__sections {
    margin-block-start: 26px;
  }
}
</style>
