/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID } from "@prose-im/prose-sdk-js";
import { defineStore } from "pinia";
import mitt from "mitt";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type AvatarDataURL = string;

type EventAvatarGeneric = { jid: JID };

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Avatar {
  entries: AvatarEntries;
}

interface AvatarEntries {
  [jid: string]: AvatarDataURL;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  loading: {} as { [jid: string]: boolean }
};

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $avatar = defineStore("avatar", {
  persist: false,

  state: (): Avatar => {
    return {
      entries: {}
    };
  },

  getters: {
    getAvatarDataUrl: function () {
      return (jid: JID): AvatarDataURL | undefined => {
        return this.assert(jid);
      };
    }
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    assert(jid: JID): AvatarDataURL | undefined {
      return this.entries[jid.toString()];
    },

    async load(jid: JID): Promise<void> {
      const jidString = jid.toString();

      // Not already loading? Load now.
      if (LOCAL_STATES.loading[jidString]) {
        return;
      }

      // Mark as loading
      LOCAL_STATES.loading[jidString] = true;

      // Load avatar data
      const avatarResponse = await Broker.$profile.loadAvatarData(jid);

      if (avatarResponse) {
        // Set avatar data
        this.$patch(() => {
          this.entries[jidString] = avatarResponse.dataURL;
        });

        // Emit IPC changed event
        EventBus.emit("avatar:changed", {
          jid: jid
        } as EventAvatarGeneric);
      } else {
        // Set avatar data
        this.$patch(() => {
          delete this.entries[jidString];
        });

        EventBus.emit("avatar:flushed", {
          jid: jid
        } as EventAvatarGeneric);
      }

      // Remove loading marker
      delete LOCAL_STATES.loading[jidString];
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { EventAvatarGeneric };
export default $avatar;
