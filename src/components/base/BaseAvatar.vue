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
    }
  },

  data() {
    return {
      // --> STATE <--

      lastJID: null
    };
  },

  computed: {
    backgroundImage() {
      const avatar = Store.$avatar.getAvatar(this.jid);

      // Generate avatar URL from avatar data?
      if (avatar !== undefined) {
        return `url(${avatar.meta.type};${avatar.data.encoding},${avatar.data.data})`;
      }

      return null;
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
  },

  watch: {
    jid: {
      immediate: true,

      handler(newValue: JID, oldValue: JID) {
        if (newValue !== oldValue) {
          if (Store.$session.connected === true) {
            this.lastJID = newValue;

            // Load new avatar
            // TODO: delay stanzas when client is disconnected
            Store.$avatar.load(newValue);
          }
        }
      }
    }
  },

  created() {
    // TODO: put this in a utility helper

    // Bind connected handler
    Store.$session.events().on("connected", this.onStoreConnected);
  },

  beforeUnmount() {
    // Unbind connected handler
    Store.$session.events().off("connected", this.onStoreConnected);
  },

  methods: {
    onStoreConnected(connected: boolean): void {
      if (
        connected === true &&
        (this.lastJID === null || this.jid.equals(this.lastJID) === false)
      ) {
        this.lastJID = this.jid;

        // Load new avatar
        Store.$avatar.load(this.jid);
      }
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
