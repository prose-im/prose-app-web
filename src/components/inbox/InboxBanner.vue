<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-banner(
  v-if="hasBanner"
)
  base-banner(
    :icon="banner.icon"
    :title="banner.title"
    :description="banner.description"
    class="v-app-inbox-base__banner"
  )
    template(
      v-if="banner.action"
      v-slot:action
    )
      base-button(
        @click="onActionClick(banner.action.id)"
        tint="light"
        size="medium"
      )
        | {{ banner.action.label }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: STORES
import Store from "@/store";

// INTERFACES
interface Banner {
  icon: string;
  title: string;
  description: string;
  action?: BannerAction;
}

interface BannerAction {
  id: string;
  label: string;
}

export default {
  name: "InboxBanner",

  computed: {
    hasBanner(): boolean {
      return this.banner !== null;
    },

    banner(): Banner | null {
      // Disconnected?
      if (!this.session.connected) {
        return {
          icon: "exclamationmark.triangle.fill",
          title: "You are offline",
          description:
            "New messages will not appear, reconnect to send messages.",

          action: {
            id: "reconnect",
            label: "Reconnect now"
          }
        };
      }

      return null;
    },

    session(): typeof Store.$session {
      return Store.$session;
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onActionClick(id: string): void {
      // TODO
      console.error("==> action click: " + id);
    }
  }
};
</script>
