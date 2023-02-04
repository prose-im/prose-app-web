<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-sidebar-context
  base-avatar(
    :presence-class="avatarPresenceClass"
    class="c-sidebar-context__avatar"
    jid="baptiste@prose.org"
    size="32px"
    presence-type="available"
    presence-show="chat"
    presence-size="small"
  )

  .c-sidebar-context__current
    p.c-sidebar-context__team.u-bold
      | Crisp

    p.c-sidebar-context__status
      span.c-sidebar-context__status-icon
        | 🚀

      span.c-sidebar-context__status-text
        | Building new features.

  base-action(
    class="c-sidebar-context__actions"
    icon="ellipsis"
    context="grey"
    rotate="90deg"
    size="16px"
    auto-width
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SidebarContext",

  props: {
    avatarPresenceClass: {
      type: String,
      default: null
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-context";

// VARIABLES
/* TODO */

.c-sidebar-context {
  display: flex;
  align-items: center;

  #{$c}__avatar {
    margin-inline-end: 13px;
    flex: 0 0 auto;
  }

  #{$c}__current {
    flex: 1;

    #{$c}__team {
      color: $color-text-primary;
      font-size: 14px;
    }

    #{$c}__status {
      margin-block-start: 4px;

      #{$c}__status-icon {
        font-size: 15px;
        margin-inline-end: 5px;
      }

      #{$c}__status-text {
        color: $color-text-secondary;
        font-size: 13px;

        &:before {
          content: "“";
        }

        &:after {
          content: "”";
        }
      }
    }
  }

  #{$c}__actions {
    margin-inline-start: 6px;
    margin-inline-end: -6px;
    flex: 0 0 auto;
  }
}
</style>
