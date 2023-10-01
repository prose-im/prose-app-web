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

      availability: {
        autoAway: {
          enabled: false,
          after: "5m"
        }
      },

      notifications: {
        configuration: {
          topics: "all",

          when: {
            days: "weekdays",

            time: {
              from: "10:00",
              to: "18:00"
            }
          }
        },

        action: {
          notify: {
            badge: true,
            sound: false,
            banner: true
          }
        },

        devices: {
          mobile: {
            alerts: {
              enabled: true,
              after: "5m"
            }
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
          imagePreviews: {
            enabled: true,
            size: "large"
          }
        }
      },

      calls: {
        camera: {
          inputSource: "system"
        },

        microphone: {
          inputSource: "system"
        },

        sound: {
          outputSource: "system"
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
      }
    };
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $settings;
