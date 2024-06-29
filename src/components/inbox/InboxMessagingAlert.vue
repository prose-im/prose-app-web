<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-messaging-alert
  slot

  base-icon(
    v-if="icon"
    :name="icon"
    size="9px"
    class="c-inbox-messaging-alert__icon"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxMessagingAlert",

  props: {
    icon: {
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
$c: ".c-inbox-messaging-alert";

#{$c} {
  background-color: rgb(var(--color-background-primary));
  border: 1px solid rgb(var(--color-border-secondary));
  color: rgb(var(--color-text-primary));
  font-size: ($font-size-baseline - 2px);
  line-height: 15px;
  padding-inline: 18px;
  padding-block: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 30px;
  box-shadow: 0 1px 3px 0 rgba(var(--color-shadow-primary), 0.04);

  &:hover {
    background-color: rgb(var(--color-background-secondary));
    border-color: rgb(var(--color-border-primary));
  }

  &:active {
    background-color: darken-var(var(--color-background-secondary), 0.75%);
  }

  #{$c}__icon {
    fill: currentcolor;
    margin-inline-start: 8px;
    margin-block-end: -1px;
  }
}
</style>
