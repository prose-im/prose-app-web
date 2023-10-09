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
  :style=`{
    height: size
  }`
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
    }
  },

  computed: {
    href() {
      return `#${ICON_PREFIX}-${this.name}`;
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
