<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
span.c-base-client
  span(
    v-if="clientImageUrl"
    :style="logoStyle"
    class="c-base-client__logo"
  )

  span(
    :style="nameStyle"
    class="c-base-client__name u-medium"
  )
    | {{ name }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const LOGO_MARGIN_INLINE_END_FROM_SIZE_RATIO = 0.25;
const NAME_FONT_SIZE_OFFSET = 2;

const CLIENT_IMAGE_NAMES = {
  adium: "adium",
  aparté: "aparte",
  "astrachat xmpp client": "astrachat",
  "beagle im": "beagle",
  "blabber.im": "blabber",
  chatsecure: "chatsecure",
  conversations: "conversations",
  dino: "dino",
  gajim: "gajim",
  jappix: "jappix",
  kaidan: "kaidan",
  "miranda ng": "miranda",
  "monal im": "monal",
  movim: "movim",
  moxxy: "moxxy",
  pidgin: "pidgin",
  poezio: "poezio",
  prose: "prose",
  psi: "psi",
  "psi+": "psi",
  "siskin im": "siskin",
  snikket: "snikket",
  yaxim: "yaxim"
};

export default {
  name: "BaseClient",

  props: {
    name: {
      type: String,
      required: true
    },

    size: {
      type: String,
      default: "16px"
    }
  },

  computed: {
    clientImageUrl(): string | null {
      const clientImageName =
        CLIENT_IMAGE_NAMES[this.name.toLowerCase()] || null;

      if (clientImageName !== null) {
        return `/images/components/base/BaseClient/${clientImageName}.png`;
      }

      return null;
    },

    sizeNumeric(): number {
      return parseInt(this.size.replace("px", ""));
    },

    logoStyle(): { [property: string]: string | null } {
      return {
        backgroundImage:
          this.clientImageUrl !== null ? `url("${this.clientImageUrl}")` : null,

        height: this.size,
        width: this.size,

        marginInlineEnd: `${Math.floor(
          this.sizeNumeric * LOGO_MARGIN_INLINE_END_FROM_SIZE_RATIO
        )}px`
      };
    },

    nameStyle(): { [property: string]: string } {
      return {
        fontSize: `${this.sizeNumeric - NAME_FONT_SIZE_OFFSET}px`,
        lineHeight: this.size
      };
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-client";

#{$c} {
  display: inline-flex;
  align-items: center;

  #{$c}__logo {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    flex: 0 0 auto;
  }

  #{$c}__name {
    color: rgb(var(--color-text-primary));
  }
}
</style>
