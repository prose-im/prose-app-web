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
  .v-app-inbox-base__topbar

  .v-app-inbox-base__content
    .v-app-inbox-base__messages
      inbox-messaging(
        class="v-app-inbox-base__timeline"
      )

      .v-app-inbox-base__form

    .v-app-inbox-base__userinfo
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import InboxMessaging from "@/components/inbox/InboxMessaging.vue";

export default {
  name: "AppInboxBase",

  components: { InboxMessaging }
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
  flex-direction: column;

  #{$c}__topbar {
    background-color: $color-base-grey-light;
    border-bottom: 1px solid $color-border-secondary;
    height: 60px;
    flex: 0 0 auto;
  }

  #{$c}__content {
    flex: 1;
    display: flex;

    #{$c}__messages {
      display: flex;
      flex: 1;
      flex-direction: column;

      #{$c}__timeline {
        width: 100%;
        height: 100%;
        flex: 1;
      }

      #{$c}__form {
        border-top: 1px solid $color-border-secondary;
        height: 65px;
        flex: 0 0 auto;
      }
    }

    #{$c}__userinfo {
      border-left: 1px solid $color-border-secondary;
      width: 280px;
      flex: 0 0 auto;
    }
  }
}
</style>
