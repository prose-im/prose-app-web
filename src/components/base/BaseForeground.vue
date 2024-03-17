<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-foreground(
  ref="root"
  tabindex="1"
)
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPOSABLES
import { useInterfaceMounted } from "@/composables/interface";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "BaseForeground",

  setup() {
    useInterfaceMounted((mounted: boolean) => {
      Store.$session.setInterfaceForegroundMounted(mounted);
    });
  },

  mounted() {
    // Focus on component root (so that bound event listeners can receive \
    //   events, eg. keyboard events such as hotkeys)
    // Notice: for this to work, a 'tabindex' of '1' on the root element is \
    //   also required.
    (this.$refs.root as HTMLElement).focus();
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-foreground";

#{$c} {
  background-color: rgba(var(--color-base-grey-dark), 0.35);
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  inset: 0;
  z-index: $index-foreground-secondary;
}
</style>
