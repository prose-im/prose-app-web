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
        :disabled="banner.action.loading"
        :loading="banner.action.loading"
        tint="light"
        size="medium"
      )
        | {{ banner.action.label }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPOSABLES
import { useEvents } from "@/composables/events";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// CONSTANTS
const CONSIDER_DISCONNECTED_DEBOUNCE_DELAY_DEFAULT = 1000; // 1 second
const CONSIDER_DISCONNECTED_DEBOUNCE_DELAY_INITIAL = 8000; // 8 seconds

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
  loading?: boolean;
}

export default {
  name: "InboxBanner",

  data() {
    return {
      // --> STATE <--

      hadInitialConnect: false,
      isDisconnected: false,

      considerDisconnectedTimeout: null as null | ReturnType<typeof setTimeout>
    };
  },

  computed: {
    hasBanner(): boolean {
      return this.banner !== null;
    },

    banner(): Banner | null {
      // Disconnected?
      if (this.isDisconnected) {
        return {
          icon: "exclamationmark.triangle.fill",
          title: "You are offline",
          description:
            "New messages will not appear, reconnect to send messages.",

          action:
            this.session.connecting === true
              ? {
                  id: "reconnecting",
                  label: "Reconnecting…",
                  loading: true
                }
              : {
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

  created() {
    // Initialize first disconnected value
    this.refreshInitialDisconnected();

    // Bind session event handlers
    useEvents(Store.$session, {
      connected: this.onStoreConnected
    });
  },

  methods: {
    // --> HELPERS <--

    refreshInitialDisconnected(): void {
      this.onStoreConnected(this.session.connected);
    },

    // --> EVENT LISTENERS <--

    onActionClick(id: string): void {
      switch (id) {
        case "reconnect": {
          Broker.client.reconnect();

          break;
        }
      }
    },

    onStoreConnected(connected: boolean): void {
      // Clear 'consider disconnected' timeout (as needed)
      if (this.considerDisconnectedTimeout !== null) {
        clearTimeout(this.considerDisconnectedTimeout);

        this.considerDisconnectedTimeout = null;
      }

      if (connected === true) {
        // Mark as connected straight away
        this.isDisconnected = false;

        // Register as having done 'initial connect' (as was connected at \
        //   least once)
        this.hadInitialConnect = true;
      } else {
        // Mark as disconnected after some time has passed (no need to show \
        //   this in the UI too soon)
        this.considerDisconnectedTimeout = setTimeout(
          () => {
            this.considerDisconnectedTimeout = null;

            // Mark as disconnected (some time has passed)
            this.isDisconnected = true;
          },

          this.hadInitialConnect === true
            ? CONSIDER_DISCONNECTED_DEBOUNCE_DELAY_DEFAULT
            : CONSIDER_DISCONNECTED_DEBOUNCE_DELAY_INITIAL
        );
      }
    }
  }
};
</script>
