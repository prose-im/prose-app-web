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
  :class=`[
    "c-base-avatar",
    "c-base-avatar--shadow-" + shadow
  ]`
  :style=`{
    backgroundImage: backgroundImage,
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
import { JID } from "@xmpp/jid";

// PROJECT: STORES
import Store from "@/store";

// CONSTANTS
const SIZE_TO_BORDER_RADIUS_RATIO = 0.1;

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

    square: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    backgroundImage() {
      const avatarDataUrl = Store.$avatar.getAvatarDataUrl(this.jid);

      if (avatarDataUrl) {
        return `url(${avatarDataUrl})`;
      }

      return undefined;
    },

    borderRadius() {
      // Acquire numeric size (size should be zero if square requested)
      const sizeNumeric =
        this.square === true ? 0 : parseInt(this.size.replace("px", ""), 10);

      // Compute numeric border radius
      const borderRadiusNumeric = Math.ceil(
        sizeNumeric * SIZE_TO_BORDER_RADIUS_RATIO
      );

      // Return pixel-sized border radius
      return `${borderRadiusNumeric}px`;
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
  background-color: $color-base-grey-light;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
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
