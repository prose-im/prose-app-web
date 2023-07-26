<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  v-text="contentText"
  :class=`[
    "c-base-avatar",
    "u-bold",
    "c-base-avatar--shadow-" + shadow
  ]`
  :style=`{
    backgroundColor: backgroundColor,
    backgroundImage: backgroundImage,
    fontSize: fontSize,
    lineHeight: size,
    height: size,
    width: size,
    borderRadius: borderRadius
  }`
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@prose-im/prose-core-client-wasm";

// PROJECT: STORES
import Store from "@/store";

// INSTANCES
const TEXTUAL_INITIALS_NORMALIZE_REGEX = /\p{Diacritic}/gu;

// CONSTANTS
const SIZE_TO_FONT_SIZE_RATIO = 0.5;
const SIZE_TO_BORDER_RADIUS_RATIO = 0.1;

const TEXTUAL_PALETTE_COLORS = [
  "df74c9",
  "05cd8f",
  "52a6db",
  "ee733d",
  "f48686",
  "6b6f8c",
  "e13030",
  "8e30de",
  "b258ec",
  "f15e5e",
  "3159ea",
  "7ab0ff",
  "78c670",
  "18aeec",
  "8125d4",
  "c32ea3",
  "415dae",
  "d79b25",
  "ce811a",
  "2ba032"
];

export default {
  name: "BaseAvatar",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    size: {
      type: String,
      default: "100px"
    },

    shadow: {
      type: String,
      default: "normal",

      validator(x: string) {
        return ["none", "light", "normal"].includes(x);
      }
    },

    dataUrl: {
      type: String,
      default: null
    },

    square: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    isTextual(): boolean {
      return !this.backgroundImage ? true : false;
    },

    backgroundImage(): string | void {
      const avatarDataUrl =
        this.dataUrl !== null
          ? this.dataUrl
          : Store.$avatar.getAvatarDataUrl(this.jid);

      if (avatarDataUrl) {
        return `url(${avatarDataUrl})`;
      }

      return undefined;
    },

    backgroundColor(): string | void {
      // Generate background color? (as avatar is textual)
      if (this.isTextual === true) {
        return this.generateTextualPalette(this.jid);
      }

      return undefined;
    },

    contentText(): string | void {
      // Generate content text? (as avatar is textual)
      if (this.isTextual === true) {
        return this.normalizeTextualInitials(
          this.generateTextualInitials(this.jid, this.rosterName) || undefined
        );
      }

      return undefined;
    },

    fontSize(): string | void {
      // Compute font size? (only if avatar is textual)
      if (this.isTextual === true) {
        // Compute numeric font size
        const fontSizeNumeric = Math.ceil(
          this.sizeNumeric * SIZE_TO_FONT_SIZE_RATIO
        );

        // Return pixel-sized font size
        return `${fontSizeNumeric}px`;
      }

      return undefined;
    },

    borderRadius(): string {
      // Acquire numeric size (size should be zero if square requested)
      const sizeNumeric = this.square === true ? 0 : this.sizeNumeric;

      // Compute numeric border radius
      const borderRadiusNumeric = Math.ceil(
        sizeNumeric * SIZE_TO_BORDER_RADIUS_RATIO
      );

      // Return pixel-sized border radius
      return `${borderRadiusNumeric}px`;
    },

    sizeNumeric(): number {
      return parseInt(this.size.replace("px", ""), 10);
    },

    rosterName(): ReturnType<typeof Store.$roster.getEntryName> {
      return Store.$roster.getEntryName(this.jid);
    }
  },

  methods: {
    // --> HELPERS <--

    normalizeTextualInitials(initials?: string): string | void {
      // Enforce initials to uppercase, and remove any accent and diacritic
      if (initials) {
        return initials
          .toUpperCase()
          .normalize("NFD")
          .replace(TEXTUAL_INITIALS_NORMALIZE_REGEX, "");
      }

      return undefined;
    },

    generateTextualPalette(jid: JID): string {
      const bareJIDString = jid.bare().toString();

      // Compute JID fingerprint
      let jidFingerprint = 0;

      for (let i = 0; i < bareJIDString.length; i++) {
        jidFingerprint += bareJIDString.charCodeAt(i);
      }

      // Acquire color based on JID fingerprint
      const color =
        TEXTUAL_PALETTE_COLORS[jidFingerprint % TEXTUAL_PALETTE_COLORS.length];

      return `#${color}`;
    },

    generateTextualInitials(jid: JID, name = ""): string | void {
      // #1. Extract initials from name (if any, and if long enough)
      if (name) {
        const nameChunks = name
          .split(" ")
          .map(nameChunk => {
            return nameChunk.trim();
          })
          .filter(nameChunk => {
            return nameChunk ? true : false;
          });

        // Extract first name and family name initials?
        if (nameChunks.length >= 2) {
          return `${nameChunks[0][0]}${nameChunks[1][0]}`;
        }

        // Extract first two characters of first name?
        if (nameChunks.length > 0 && nameChunks[0].length >= 2) {
          return nameChunks[0].substring(0, 2);
        }
      }

      const node = jid.bare().node;

      // #2. Extract initials from JID (fallback)
      if (node && node.length >= 1) {
        return node.substring(0, 2);
      }

      // No initials extracted
      return undefined;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-avatar";

.c-base-avatar {
  color: $color-text-reverse;
  background-color: $color-base-grey-light;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  text-align: center;
  letter-spacing: 0.25px;
  display: inline-block;

  // --> SHADOWS <--

  &--shadow-normal {
    box-shadow: 0 2px 4px 0 rgba($color-black, 0.08);
  }

  &--shadow-light {
    box-shadow: 0 0 2px 0 rgba($color-black, 0.08);
  }
}
</style>
