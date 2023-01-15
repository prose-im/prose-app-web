<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.v-app-inbox-base
  .v-app-inbox-base__content
    .v-app-inbox-base__topbar

    iframe.v-app-inbox-base__timeline(
      src="/includes/views/messaging.html"
    )

    .v-app-inbox-base__form

  .v-app-inbox-base__userinfo
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "AppInboxBase"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-inbox-base";

.v-app-inbox-base {
  height: 100%;
  width: 100%;
  display: flex;

  #{$c}__content {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  #{$c}__userinfo {
    border-left: 1px solid $color-base-grey-normal;
    width: 280px;
    flex: 0 0 auto;
  }

  #{$c}__topbar {
    border-bottom: 1px solid $color-base-grey-normal;
    height: 60px;
    flex: 0 0 auto;
  }

  #{$c}__timeline {
    width: 100%;
    height: 100%;
    flex: 1;
  }

  #{$c}__form {
    border-top: 1px solid $color-base-grey-normal;
    height: 90px;
    flex: 0 0 auto;
  }
}
</style>
