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
import { JID, ParticipantId, RoomID } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// INSTANCES
const TEXTUAL_INITIALS_NORMALIZE_REGEX = /\p{Diacritic}/gu;

// CONSTANTS
const SIZE_TO_FONT_SIZE_RATIO = 0.5;
const SIZE_TO_BORDER_RADIUS_RATIO = 0.2;

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
      default: null
    },

    participantId: {
      type: Object as PropType<ParticipantId>,
      default: null
    },

    userId: {
      type: String,
      default: null
    },

    name: {
      type: String,
      default: null
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
    },

    circle: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    jidLikeSource(): string | null {
      // #1. Prefer using JID (if given)
      if (this.jid !== null) {
        return this.jid.toString();
      }

      // #2. Prefer participant identifier (if given)
      if (this.participantId !== null) {
        return this.participantId.toString();
      }

      // #3. Fallback on user identifier (if given)
      if (this.userId !== null) {
        return this.userId;
      }

      // #4. No JID like value provided
      return null;
    },

    isTextual(): boolean {
      return !this.backgroundImage ? true : false;
    },

    backgroundImage(): string | void {
      // Acquire background image? (a JID-like is required to obtain avatar \
      //   data)
      if (this.jidLikeSource !== null) {
        const avatarDataUrl =
          this.dataUrl !== null
            ? this.dataUrl
            : Store.$avatar.getAvatarDataUrl(this.jidLikeSource);

        if (avatarDataUrl) {
          return `url(${avatarDataUrl})`;
        }
      }

      return undefined;
    },

    backgroundColor(): string | void {
      // Generate background color? (as avatar is textual)
      if (this.isTextual === true) {
        const value = this.jidLikeSource || this.name || "";

        if (value) {
          return this.generateTextualPalette(value);
        }
      }

      return undefined;
    },

    contentText(): string | void {
      // Generate content text? (as avatar is textual)
      if (this.isTextual === true) {
        const name = this.name || this.roomName || "";

        return this.normalizeTextualInitials(
          this.generateTextualInitials(this.jidLikeSource, name) || undefined
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
      // Acquire border radius numeric value
      let borderRadiusNumeric;

      if (this.square === true) {
        borderRadiusNumeric = 0;
      } else if (this.circle === true) {
        borderRadiusNumeric = this.sizeNumeric;
      } else {
        // Compute numeric border radius
        borderRadiusNumeric = Math.ceil(
          this.sizeNumeric * SIZE_TO_BORDER_RADIUS_RATIO
        );
      }

      // Return pixel-sized border radius
      return `${borderRadiusNumeric}px`;
    },

    sizeNumeric(): number {
      return parseInt(this.size.replace("px", ""));
    },

    roomName(): string {
      const room =
        this.jidLikeSource !== null
          ? Store.$room.getRoom(this.jidLikeSource as RoomID)
          : undefined;

      return room?.name || "";
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

    generateTextualPalette(value: string): string {
      // Compute value fingerprint
      let valueFingerprint = 0;

      for (let i = 0; i < value.length; i++) {
        valueFingerprint += value.charCodeAt(i);
      }

      // Acquire color based on value fingerprint
      const color =
        TEXTUAL_PALETTE_COLORS[
          valueFingerprint % TEXTUAL_PALETTE_COLORS.length
        ];

      return `#${color}`;
    },

    generateTextualInitials(jidLike: string | null, name = ""): string | void {
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
        if (nameChunks.length > 0 && nameChunks[0].length >= 1) {
          return nameChunks[0].substring(0, 2);
        }
      }

      // #2. Extract initials from JID, if identifier is JID-like (fallback)
      if (jidLike !== null) {
        let jidParts = jidLike.split("@");

        if (jidParts[0]?.length >= 1 && jidParts[1]?.length >= 1) {
          return jidParts[0].substring(0, 2);
        }
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

#{$c} {
  color: rgb(var(--color-white-fixed));
  background-color: rgb(var(--color-base-grey-light));
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  text-align: center;
  letter-spacing: 0.25px;
  display: inline-block;

  // --> SHADOWS <--

  &--shadow-normal {
    box-shadow: 0 2px 4px 0 rgba(var(--color-shadow-primary), 0.08);
  }

  &--shadow-light {
    box-shadow: 0 0 2px 0 rgba(var(--color-shadow-primary), 0.08);
  }
}
</style>
