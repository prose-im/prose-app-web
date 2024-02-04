<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
svg(
  :style="iconStyle"
  class="c-base-icon"
)
  use(
    :xlink:href="href"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: ICONS
import icons from "@/commons/icons";

// CONSTANTS
const ICON_PREFIX = "icon";

export default {
  name: "BaseIcon",

  props: {
    name: {
      type: String,
      required: true,

      validator(x: string) {
        return icons.has(`${ICON_PREFIX}-${x}`);
      }
    },

    size: {
      type: String,
      default: "18px"
    },

    fill: {
      type: String,
      default: null,

      validator(x: string) {
        return x.startsWith("rgb(") && x.endsWith(")");
      }
    }
  },

  computed: {
    href(): string {
      return `#${ICON_PREFIX}-${this.name}`;
    },

    iconStyle(): { [property: string]: string | null } {
      return {
        fill: this.fill,
        height: this.size
      };
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-icon";

// VARIABLES
$icon-fill-default: rgb(var(--color-black));

.c-base-icon {
  fill: $icon-fill-default;
  aspect-ratio: 1;
  display: inline-block;
}
</style>
