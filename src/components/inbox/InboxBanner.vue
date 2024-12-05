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
    :color="banner.color"
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
// NPM
import { PropType } from "vue";
import { JID, Room } from "@prose-im/prose-sdk-js";

// PROJECT: COMPOSABLES
import { useEvents } from "@/composables/events";
import { useTimerMinutes } from "@/composables/timer";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// CONSTANTS
const MINUTE_TO_MILLISECONDS = 60000; // 1 minute

const CONSIDER_DISCONNECTED_DEBOUNCE_DELAY_DEFAULT = 1000; // 1 second
const CONSIDER_DISCONNECTED_DEBOUNCE_DELAY_INITIAL = 8000; // 8 seconds

const CONSIDER_TIME_ASLEEP_AFTER = 20; // 8pm
const CONSIDER_TIME_ASLEEP_BEFORE = 8; // 8am

// INTERFACES
interface Banner {
  color: string;
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

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    room: {
      type: Object as PropType<Room>,
      default: undefined
    }
  },

  setup() {
    // Export a local date that monotonically updates every minute
    // Notice: this is required, since a Vue computed on a Date instance will \
    //   only return once, and be treated as a static value afterwards. \
    //   Meaning the date value would not progress as time passes.
    const { date } = useTimerMinutes();

    return {
      localDateMinutes: date
    };
  },

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
          color: "grey",
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

      // User is on a sleep time? (that's different from ours)
      if (this.userSleepTime) {
        return {
          color: "white",
          icon: "clock",
          title: `It is ${this.userSleepTime} for ${this.room?.name || "them"}`,
          description: "Your messages might get read a bit later."
        };
      }

      return null;
    },

    userSleepTime(): string | null {
      const userTimezone =
        this.profile?.information?.location?.timezone || null;

      // Return user time only when user TZO is different from our local TZO, \
      //   and user is possibly currently in sleeping hours.
      if (
        userTimezone !== null &&
        userTimezone.offset !== this.localTimezoneOffset
      ) {
        // Apply offset to date (in minutes)
        // Notice: create new date object, as not to mutate the provided one.
        const userDate = new Date(
          this.localDateMinutes.getTime() +
            userTimezone.offset * MINUTE_TO_MILLISECONDS
        );

        const userTimeHour = userDate.getUTCHours();

        if (
          userTimeHour >= CONSIDER_TIME_ASLEEP_AFTER ||
          userTimeHour < CONSIDER_TIME_ASLEEP_BEFORE
        ) {
          return this.$filters.date.localTime(
            this.localDateMinutes,
            userTimezone.offset
          );
        }
      }

      return null;
    },

    localTimezoneOffset(): number {
      // Return current local TZO (for local environment)
      // Important: negate result since JS returns inverted TZOs.
      return -this.localDateMinutes.getTimezoneOffset();
    },

    session(): typeof Store.$session {
      return Store.$session;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
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
