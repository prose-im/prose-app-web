/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { defineStore } from "pinia";
import mitt from "mitt";

// PROJECT: STORES
import { STORE_PERSIST_PREFIX, STORE_PERSIST_BOOT } from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $settings = defineStore("settings", {
  persist: true,

  state: () => {
    return {
      appearance: {
        theme: "system"
      },

      notifications: {
        pause: {
          until: null as number | null
        },

        configuration: {
          topics: "all",
          replies: true,

          when: {
            days: "weekdays",

            time: {
              from: "08:00",
              to: "20:00"
            }
          }
        },

        action: {
          notify: {
            badge: true,
            sound: true,
            banner: true
          }
        }
      },

      messages: {
        chats: {
          chatstates: true,
          spellcheck: false,
          clock24h: false
        },

        files: {
          uploads: {
            optimize: true
          },

          imagePreviews: {
            enabled: true,
            size: "large"
          }
        }
      },

      updates: {
        channel: "stable"
      },

      privacy: {
        report: {
          analytics: false,
          crashes: true
        }
      },

      network: {
        connection: "auto"
      }
    };
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    setAppearanceTheme(value: string): void {
      this.setGeneric(this.appearance, "theme", value, {
        event: "appearance:theme"
      });

      // Store in local storage? (for use during boot, before store is loaded)
      if (window.localStorage !== undefined) {
        const bootStorageKey = [
          STORE_PERSIST_PREFIX,
          STORE_PERSIST_BOOT,
          "theme"
        ].join(":");

        window.localStorage.setItem(bootStorageKey, value);
      }
    },

    setNotificationsPauseUntil(value: number | null): void {
      this.setGeneric(this.notifications.pause, "until", value);
    },

    setNotificationsConfigurationTopics(value: string): void {
      this.setGeneric(this.notifications.configuration, "topics", value);
    },

    setNotificationsConfigurationReplies(value: boolean): void {
      this.setGeneric(this.notifications.configuration, "replies", value);
    },

    setNotificationsConfigurationWhenDays(value: string): void {
      this.setGeneric(this.notifications.configuration.when, "days", value);
    },

    setNotificationsConfigurationWhenTimeFrom(value: string): void {
      this.setGeneric(
        this.notifications.configuration.when.time,
        "from",
        value
      );
    },

    setNotificationsConfigurationWhenTimeTo(value: string): void {
      this.setGeneric(this.notifications.configuration.when.time, "to", value);
    },

    setNotificationsActionNotifyBadge(value: boolean): void {
      this.setGeneric(this.notifications.action.notify, "badge", value);
    },

    setNotificationsActionNotifySound(value: boolean): void {
      this.setGeneric(this.notifications.action.notify, "sound", value);
    },

    setNotificationsActionNotifyBanner(value: boolean): void {
      this.setGeneric(this.notifications.action.notify, "banner", value);
    },

    setMessagesChatsChatstates(value: boolean): void {
      this.setGeneric(this.messages.chats, "chatstates", value);
    },

    setMessagesChatsSpellcheck(value: boolean): void {
      this.setGeneric(this.messages.chats, "spellcheck", value);
    },

    setMessagesChatsClock24H(value: boolean): void {
      this.setGeneric(this.messages.chats, "clock24h", value, {
        event: "messages:chats:clock24h"
      });
    },

    setMessagesFilesUploadsOptimize(value: boolean): void {
      this.setGeneric(this.messages.files.uploads, "optimize", value);
    },

    setMessagesFilesImagePreviewsEnabled(value: boolean): void {
      this.setGeneric(this.messages.files.imagePreviews, "enabled", value, {
        event: "messages:files:image:previews:enabled"
      });
    },

    setMessagesFilesImagePreviewsSize(value: string): void {
      this.setGeneric(this.messages.files.imagePreviews, "size", value, {
        event: "messages:files:image:previews:size"
      });
    },

    setUpdatesChannel(value: string): void {
      this.setGeneric(this.updates, "channel", value);
    },

    setPrivacyReportAnalytics(value: boolean): void {
      this.setGeneric(this.privacy.report, "analytics", value);
    },

    setPrivacyReportCrashes(value: boolean): void {
      this.setGeneric(this.privacy.report, "crashes", value);
    },

    setNetworkConnection(value: string): void {
      const hasChanged = this.setGeneric(this.network, "connection", value);

      // Request to refresh the broker client connection?
      if (hasChanged === true) {
        Broker.client.refresh();
      }
    },

    setGeneric<ValueType>(
      container: { [key: string]: ValueType },
      key: string,
      value: ValueType,
      options?: { event?: string }
    ): boolean {
      // Check if will change
      const willChange = container[key] !== value ? true : false;

      if (willChange === true) {
        // Update value
        this.$patch(() => {
          container[key] = value;
        });

        // Broadcast state change?
        if (options?.event) {
          EventBus.emit(options.event, value);
        }

        // Has changed
        return true;
      }

      // Has not changed
      return false;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $settings;
