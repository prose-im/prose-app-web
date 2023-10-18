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
    :jid="jid"
    :room="room"
    class="v-app-inbox-base__topbar"
  )

  .v-app-inbox-base__content
    .v-app-inbox-base__messages
      inbox-banner

      inbox-messaging(
        :room="room"
        class="v-app-inbox-base__timeline"
      )

      inbox-form(
        :room="room"
        class="v-app-inbox-base__form"
      )

    inbox-userinfo(
      v-if="layout.inbox.userinfo.visible"
      :jid="jid"
      class="v-app-inbox-base__userinfo"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, Room, RoomID } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import InboxBanner from "@/components/inbox/InboxBanner.vue";
import InboxMessaging from "@/components/inbox/InboxMessaging.vue";

// PROJECT: ASSEMBLIES
import InboxForm from "@/assemblies/inbox/InboxForm.vue";
import InboxTopbar from "@/assemblies/inbox/InboxTopbar.vue";
import InboxUserinfo from "@/assemblies/inbox/InboxUserinfo.vue";

export default {
  name: "AppInboxBase",

  components: {
    InboxMessaging,
    InboxBanner,
    InboxTopbar,
    InboxUserinfo,
    InboxForm
  },

  computed: {
    jid(): JID {
      return new JID(this.roomId as string);
    },

    roomId(): RoomID {
      return this.$route.params.roomId as RoomID;
    },

    room(): Room | void {
      // TODO: handle case of room not found (show placeholder data)
      return Store.$muc.getRoomByID(this.roomId);
    },

    layout(): typeof Store.$layout {
      return Store.$layout;
    }
  }
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
    background-color: rgb(var(--color-base-grey-light));
    border-block-end: 1px solid rgb(var(--color-border-secondary));
    height: $size-inbox-topbar-height;
    padding: 0 $content-padding-sides;
    flex: 0 0 auto;
  }

  #{$c}__content {
    flex: 1;
    display: flex;
    overflow: hidden;

    #{$c}__messages {
      display: flex;
      flex: 1;
      flex-direction: column;

      #{$c}__banner {
        padding-inline: ($content-padding-sides + 11px);
        flex: 0 0 auto;
      }

      #{$c}__timeline {
        width: 100%;
        height: 100%;
        flex: 1;
        position: relative;

        &:before,
        &:after {
          content: "";
          height: $size-layout-gradient-height;
          position: absolute;
          inset-inline: 0;
          pointer-events: none;
        }

        &:before {
          background-image: linear-gradient(
            0deg,
            rgba(var(--color-black), 0) 0%,
            rgba(var(--color-black), 0.015) 100%
          );
          inset-block-start: 0;
        }

        &:after {
          background-image: linear-gradient(
            180deg,
            rgba(var(--color-black), 0) 0%,
            rgba(var(--color-black), 0.01) 100%
          );
          inset-block-end: 0;
        }
      }

      #{$c}__form {
        border-block-start: 1px solid rgb(var(--color-border-secondary));
        min-height: $size-inbox-form-height;
        padding: 0 $content-padding-sides;
        flex: 0 0 auto;
      }
    }

    #{$c}__userinfo {
      border-inline-start: 1px solid rgb(var(--color-border-secondary));
      width: $size-inbox-userinfo-width;
      overflow-x: hidden;
      overflow-y: auto;
      flex: 0 0 auto;
    }
  }
}
</style>
