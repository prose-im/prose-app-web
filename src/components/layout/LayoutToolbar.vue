<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-layout-toolbar(
  data-tauri-drag-region
)
  .c-layout-toolbar__left(
    v-if="$slots.left"
  )
    slot(
      name="left"
    )

  .c-layout-toolbar__middle
    slot(
      name="middle"
    )

  .c-layout-toolbar__right(
    v-if="$slots.right"
  )
    slot(
      name="right"
    )

  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: STORES
import Store from "@/store";

export default {
  name: "LayoutToolbar",

  mounted() {
    // Mark toolbar as mounted
    Store.$layout.setToolbarMounted(true);
  },

  unmounted() {
    // Mark toolbar as unmounted
    Store.$layout.setToolbarMounted(false);
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-layout-toolbar";

#{$c} {
  &,
  #{$c}__left,
  #{$c}__right,
  #{$c}__middle {
    display: flex;
    align-items: center;
  }

  #{$c}__left,
  #{$c}__right,
  #{$c}__middle {
    pointer-events: none;

    > * {
      pointer-events: initial;
    }
  }

  #{$c}__left,
  #{$c}__right {
    flex: 0 0 auto;
  }

  #{$c}__left {
    justify-content: flex-start;
  }

  #{$c}__middle {
    padding-inline: 10px;
    justify-content: center;
    flex: 1;
  }

  #{$c}__right {
    justify-content: flex-end;
  }
}
</style>
