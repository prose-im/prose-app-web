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
    {
      "c-base-avatar--with-presence": withPresence
    }
  ]`
)
  .c-base-avatar__image(
    :style=`{
      backgroundImage: backgroundImage,
      height: size,
      width: size,
      borderRadius: borderRadius
    }`
  )

  div(
    v-if="withPresence"
    :class=`[
      "c-base-avatar__presence",
      {
        [presenceClass]: presenceClass
      }
    ]`
  )
    base-presence(
      :type="presenceType"
      :show="presenceShow"
      :size="presenceSize"
      class="c-base-avatar__presence-badge"
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
    },

    presenceType: {
      type: String,
      default: null
    },

    presenceShow: {
      type: String,
      default: null
    },

    presenceSize: {
      type: String,
      default: "small"
    },

    presenceClass: {
      type: String,
      default: null
    }
  },

  computed: {
    withPresence() {
      return this.presenceType && this.presenceShow ? true : false;
    },

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
  line-height: 0;
  position: relative;

  &,
  #{$c}__image {
    display: inline-block;
  }

  #{$c}__image {
    background-color: $color-base-grey-light;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    box-shadow: 0 2px 4px 0 rgba($color-black, 0.08);
  }

  #{$c}__presence {
    background-color: $color-white;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset-block-end: -3px;
    inset-inline-end: -4px;
    border-radius: 100%;

    #{$c}__presence-badge {
      flex: 0 0 auto;
    }
  }

  // --> BOOLEANS <--

  &--with-presence {
    #{$c}__image {
      box-shadow: 0 0 2px 0 rgba($color-black, 0.08);
    }
  }
}
</style>
