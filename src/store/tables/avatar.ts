/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, Avatar as CoreAvatar } from "@prose-im/prose-sdk-js";
import { defineStore } from "pinia";
import mitt from "mitt";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type AvatarIdentifier = string;
type AvatarDataURL = string;

type EventAvatarGeneric = { jid: JID };

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Avatar {
  entries: AvatarEntries;
}

interface AvatarEntries {
  [jid: string]: AvatarEntry;
}

interface AvatarEntry {
  id?: AvatarIdentifier;
  url?: AvatarDataURL;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  refreshing: {} as { [jid: string]: boolean }
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

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    assert(jid: JID): AvatarEntry {
      const jidString = jid.toString();

      // Assign new avatar entry for JID?
      if (!(jidString in this.entries)) {
        this.$patch(state => {
          // Insert empty data
          state.entries[jidString] = {};
        });
      }

      return this.entries[jidString];
    },

    getAvatarDataUrl(jid: JID): AvatarDataURL | void {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(jid).url;
    },

    async refresh(jid: JID, avatar: CoreAvatar): Promise<void> {
      const entry = this.assert(jid),
        jidString = jid.toString();

      // Avatar changed, and not already refreshing?
      if (
        entry.id !== avatar.id &&
        LOCAL_STATES.refreshing[jidString] !== true
      ) {
        // Mark as refreshing
        LOCAL_STATES.refreshing[jidString] = true;

        // Immediately set avatar identifier
        this.$patch(() => {
          entry.id = avatar.id;
        });

        // Load avatar data
        const avatarResponse = await Broker.$profile.loadAvatarData(
          jid,
          avatar
        );

        if (avatarResponse?.dataURL) {
          // Set avatar data
          this.$patch(() => {
            entry.url = avatarResponse.dataURL;
          });

          // Emit IPC changed event
          EventBus.emit("avatar:changed", {
            jid: jid
          } as EventAvatarGeneric);
        } else {
          // Set avatar data
          this.$patch(() => {
            delete entry.url;
          });

          EventBus.emit("avatar:flushed", {
            jid: jid
          } as EventAvatarGeneric);
        }

        // Remove refreshing marker
        delete LOCAL_STATES.refreshing[jidString];
      }
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { EventAvatarGeneric };
export default $avatar;
