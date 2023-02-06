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
  .c-sidebar-header__identity
    base-server-logo(
      class="c-sidebar-header__identity-logo"
      domain="crisp.chat"
      size="30px"
    )

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

  #{$c}__identity {
    flex: 1;

    #{$c}__identity-logo {
      cursor: pointer;
      display: block;

      &:hover {
        filter: brightness(105%);
      }

      &:active {
        filter: brightness(98%);
      }
    }
  }

  #{$c}__actions {
    margin-inline-start: 6px;
    margin-inline-end: (-1 * ($size-base-action-padding-sides - 1px));
    flex: 0 0 auto;
  }
}
</style>
