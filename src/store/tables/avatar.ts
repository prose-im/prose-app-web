/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, BareJID } from "@prose-im/prose-core-client-wasm";
import { defineStore } from "pinia";
import mitt from "mitt";

// PROJECT: BROKER
import Broker from "@/broker";
import { LoadAvatarDataResponse } from "@/broker/modules/profile";

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
      const bareJIDString = jid.bare().toString();
      return this.entries[bareJIDString];
    },

    async load(jid: BareJID): Promise<void> {
      const bareJIDString = jid.toString();

      // Not already loading? Load now.
      if (LOCAL_STATES.loading[bareJIDString]) {
        return;
      }

      // Mark as loading
      LOCAL_STATES.loading[bareJIDString] = true;

      // Load avatar data
      const avatarResponse = await Broker.$profile.loadAvatarData(jid);

      if (avatarResponse) {
        // Set avatar data
        this.$patch(() => {
          this.entries[bareJIDString] = avatarResponse.dataURL;
        });

        // Emit IPC changed event
        EventBus.emit("avatar:changed", {
          jid: jid.toJID()
        } as EventAvatarGeneric);
      } else {
        // Set avatar data
        this.$patch(() => {
          delete this.entries[bareJIDString];
        });

        EventBus.emit("avatar:flushed", {
          jid: jid.toJID()
        } as EventAvatarGeneric);
      }

      // Remove loading marker
      delete LOCAL_STATES.loading[bareJIDString];
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { EventAvatarGeneric };
export default $avatar;
