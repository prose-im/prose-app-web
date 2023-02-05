<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-sidebar-header
  layout-actions(
    class="c-sidebar-header__actions"
  )
    base-action(
      class="c-sidebar-header__action"
      icon="phone.bubble.left"
      size="18px"
    )

    base-action(
      class="c-sidebar-header__action"
      icon="square.and.pencil"
      size="18px"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SidebarHeader"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-header";

.c-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  #{$c}__actions {
    margin-inline-end: (-1 * ($size-base-action-padding-sides - 1px));
  }
}
</style>
