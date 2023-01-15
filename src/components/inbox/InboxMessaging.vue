<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-messaging
  iframe.c-inbox-messaging__frame(
    src="/includes/views/messaging.html"
    ref="frame"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxMessaging"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-messaging";

.c-inbox-messaging {
  #{$c}__frame {
    height: 100%;
    width: 100%;
  }
}
</style>
