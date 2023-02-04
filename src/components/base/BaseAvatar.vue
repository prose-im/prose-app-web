<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-avatar(
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
// CONSTANTS
const SIZE_TO_BORDER_RADIUS_RATIO = 0.1;

export default {
  name: "BaseAvatar",

  props: {
    jid: {
      type: String,
      required: true
    },

    size: {
      type: String,
      default: "100px"
    }
  },

  computed: {
    avatarImageUrl() {
      // TODO: acquire from cache using provided JID, this is only a temporary \
      //   fixture
      const handle = this.jid.split("@")[0];

      return [
        "/src/assets/images/components/base/BaseAvatar",
        `avatar-${handle}.webp`
      ].join("/");
    },

    backgroundImage() {
      return `url("${this.avatarImageUrl}")`;
    },

    borderRadius() {
      // Acquire numeric size
      const sizeNumeric = parseInt(this.size.replace("px", ""), 10);

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
  box-shadow: 0 2px 4px 0 rgba($color-black, 0.08);
}
</style>
