<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.a-inbox-topbar
  .a-inbox-topbar__left
    .a-inbox-topbar__actions
      base-action(
        class="a-inbox-topbar__action"
        icon="arrow-previous"
      )

      base-action(
        class="a-inbox-topbar__action"
        icon="arrow-next"
      )

      base-action(
        class="a-inbox-topbar__action"
        icon="history"
        dropdown
      )

  .a-inbox-topbar__middle
    span.a-inbox-topbar__identity.a-inbox-topbar__identity--name.u-bold
      | Valerian Saliou

  .a-inbox-topbar__right
    span.a-inbox-topbar__identity.a-inbox-topbar__identity--jid
      | valerian@crisp.chat

    span.a-inbox-topbar__separator

    .a-inbox-topbar__actions
      base-action(
        class="a-inbox-topbar__action"
        icon="camera"
      )

      base-action(
        class="a-inbox-topbar__action"
        icon="info"
      )

    span.a-inbox-topbar__separator

    .a-inbox-topbar__actions
      base-action(
        class="a-inbox-topbar__action"
        icon="search"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxTopbar"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-topbar";

.a-inbox-topbar {
  &,
  #{$c}__left,
  #{$c}__right,
  #{$c}__middle {
    display: flex;
    align-items: center;
  }

  #{$c}__left,
  #{$c}__right {
    flex: 0 0 auto;
  }

  #{$c}__left {
    justify-content: flex-start;
  }

  #{$c}__middle {
    color: $color-text-primary;
    padding-inline: 10px;
    justify-content: center;
    flex: 1;
  }

  #{$c}__right {
    justify-content: flex-end;
  }

  #{$c}__separator {
    background-color: $color-border-secondary;
    width: 1px;
    height: 20px;
    margin-inline: 14px;
  }

  #{$c}__identity {
    &--name {
      color: $color-text-primary;
      font-size: 16px;
    }

    &--jid {
      color: $color-text-secondary;
      font-size: 15px;
    }
  }

  #{$c}__actions {
    #{$c}__action {
      margin-inline: 3px;

      &:first-child {
        margin-inline-start: 0;
      }

      &:last-child {
        margin-inline-end: 0;
      }
    }
  }
}
</style>
