<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-layout-sidebar-details
  .c-layout-sidebar-details__header(
    v-if="$slots.header"
  )
    slot(
      name="header"
    )

  .c-layout-sidebar-details__items(
    v-if="$slots.items"
  )
    slot(
      name="items"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "LayoutSidebarDetails"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-layout-sidebar-details";

.c-layout-sidebar-details {
  #{$c}__header {
    margin-block-end: 26px;
  }

  #{$c}__items {
    > * {
      margin-block-start: 18px;

      &:first-child {
        margin-block-start: 0;
      }
    }
  }
}
</style>
