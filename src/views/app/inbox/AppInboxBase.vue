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
  inbox-topbar(
    class="v-app-inbox-base__topbar"
  )

  .v-app-inbox-base__content
    .v-app-inbox-base__messages
      inbox-messaging(
        class="v-app-inbox-base__timeline"
      )

      inbox-form(
        class="v-app-inbox-base__form"
      )

    inbox-userinfo(
      class="v-app-inbox-base__userinfo"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import InboxMessaging from "@/components/inbox/InboxMessaging.vue";

// PROJECT: ASSEMBLIES
import InboxTopbar from "@/assemblies/inbox/InboxTopbar.vue";
import InboxUserinfo from "@/assemblies/inbox/InboxUserinfo.vue";
import InboxForm from "@/assemblies/inbox/InboxForm.vue";

export default {
  name: "AppInboxBase",

  components: { InboxMessaging, InboxTopbar, InboxUserinfo, InboxForm }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-inbox-base";

// VARIABLES
$content-padding-sides: 14px;

.v-app-inbox-base {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  #{$c}__topbar {
    background-color: $color-base-grey-light;
    border-block-end: 1px solid $color-border-secondary;
    height: $size-inbox-topbar-height;
    padding: 0 $content-padding-sides;
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
        position: relative;

        &:before,
        &:after {
          content: "";
          height: 6px;
          position: absolute;
          inset-inline: 0;
          pointer-events: none;
        }

        &:before {
          background-image: linear-gradient(
            0deg,
            rgba($color-black, 0) 0%,
            rgba($color-black, 0.015) 100%
          );
          inset-block-start: 0;
        }

        &:after {
          background-image: linear-gradient(
            180deg,
            rgba($color-black, 0) 0%,
            rgba($color-black, 0.01) 100%
          );
          inset-block-end: 0;
        }
      }

      #{$c}__form {
        border-block-start: 1px solid $color-border-secondary;
        min-height: $size-inbox-form-height;
        padding: 0 $content-padding-sides;
        flex: 0 0 auto;
      }
    }

    #{$c}__userinfo {
      border-inline-start: 1px solid $color-border-secondary;
      width: 240px;
      flex: 0 0 auto;
    }
  }
}
</style>
