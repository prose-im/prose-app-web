/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID } from "@xmpp/jid";
import { defineStore } from "pinia";
import mitt from "mitt";

// PROJECT: BROKER
import Broker from "@/broker";
import { LoadAvatarDataResponse } from "@/broker/modules/profile";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type AvatarEntryMeta = {
  id: string;
  type: string;
  bytes: number;
  height?: number;
  width?: number;
};

type AvatarEntryData = {
  encoding: string;
  data: string;
};

type EventAvatarGeneric = {
  jid: JID;
  id?: string;
};

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
  meta?: AvatarEntryMeta;
  data?: AvatarEntryData;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  loading: {} as { [jid: string]: Array<(value: AvatarEntry) => void> }
};

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $avatar = defineStore("avatar", {
  persist: true,

  state: (): Avatar => {
    return {
      entries: {}
    };
  },

  getters: {
    getAvatar: function () {
      return (jid: JID): AvatarEntry => {
        return this.assert(jid);
      };
    },

    getAvatarDataUrl: function () {
      return (jid: JID): string | void => {
        const avatar = this.getAvatar(jid);

        // Generate avatar URL from avatar data?
        if (avatar.meta !== undefined && avatar.data !== undefined) {
          return (
            `data:${avatar.meta.type};` +
            `${avatar.data.encoding},${avatar.data.data}`
          );
        }

        return undefined;
      };
    }
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    assert(jid: JID): AvatarEntry {
      const bareJIDString = jid.bare().toString();

      // Assign new avatar entry for JID?
      if (!(bareJIDString in this.entries)) {
        this.$patch(state => {
          // Insert empty data
          state.entries[bareJIDString] = {};
        });
      }

      return this.entries[bareJIDString];
    },

    async load(jid: JID): Promise<AvatarEntry> {
      // Assert avatar data
      const avatar = this.assert(jid);

      // Ensure that meta are set with an identifier
      if (!avatar.meta || !avatar.meta.id) {
        throw new Error(
          `Cannot load avatar data for: '${jid}', as meta are not set!`
        );
      }

      const bareJIDString = jid.bare().toString();

      // Not already loading? Load now.
      if (!LOCAL_STATES.loading[bareJIDString]) {
        // Mark as loading
        LOCAL_STATES.loading[bareJIDString] = [];

        // Load avatar data
        const avatarResponse = await Broker.$profile.loadAvatarData(
          jid,
          avatar.meta.id
        );

        // Store avatar data?
        if (avatarResponse !== undefined) {
          this.setAvatarData(jid, avatar.meta.id, avatarResponse);
        }

        // Fire all stacked promises
        let pendingResolve;

        while ((pendingResolve = LOCAL_STATES.loading[bareJIDString].pop())) {
          pendingResolve(avatar);
        }

        // Remove loading marker
        delete LOCAL_STATES.loading[bareJIDString];

        return Promise.resolve(avatar);
      }

      return new Promise(resolve => {
        LOCAL_STATES.loading[bareJIDString].push(resolve);
      });
    },

    async updateMetadata(
      jid: JID,
      id: string | null,
      attributes?: {
        type: string;
        bytes: number;
        height?: number;
        width?: number;
      }
    ): Promise<AvatarEntry> {
      // Assert avatar data
      const avatar = this.assert(jid);

      // Check if should reload (before metas are updated; only if identifier \
      //   is set)
      const shouldReload =
        id && ((avatar.meta && avatar.meta.id !== id) || !avatar.meta)
          ? true
          : false;

      // Update stored avatar metadata
      this.setAvatarMeta(jid, id, attributes);

      // Reload avatar? (w/ updated metadata, only if avatar had been loaded)
      if (shouldReload === true) {
        // Notice: if this fires, then avatar is definitely set.
        // TODO: only load if avatar is shown on screen please (lazy load)
        return this.load(jid);
      }

      return Promise.resolve(avatar);
    },

    setAvatarMeta(
      jid: JID,
      id: string | null,
      attributes?: {
        type: string;
        bytes: number;
        height?: number;
        width?: number;
      }
    ): AvatarEntry {
      // Assert avatar data
      const avatar = this.assert(jid);

      // Check if identifier has changed
      const hasIdChanged =
        id && avatar.meta && avatar.meta.id !== id ? true : false;

      this.$patch(() => {
        if (id !== null && attributes !== undefined) {
          avatar.meta = {
            id,
            type: attributes.type,
            bytes: attributes.bytes,
            height: attributes.height,
            width: attributes.width
          };

          // Flush orphan data (due to ID mismatch)
          if (hasIdChanged === true) {
            delete avatar.data;
          }
        } else {
          // Emit IPC flushed event? (if there previously was avatar data)
          if (avatar.data) {
            EventBus.emit("avatar:flushed", { jid } as EventAvatarGeneric);
          }

          delete avatar.meta;
          delete avatar.data;
        }
      });

      return avatar;
    },

    setAvatarData(
      jid: JID,
      id: string,
      avatarDataResponse: LoadAvatarDataResponse
    ): AvatarEntry {
      // Assert avatar data
      const avatar = this.assert(jid);

      // No meta set? (this is unexpected)
      if (!avatar.meta || avatar.meta.id !== id) {
        throw new Error(
          `Cannot set avatar data for: '${jid}', as meta are not set or ` +
            `identifiers do not match!`
        );
      }

      // Set avatar data
      this.$patch(() => {
        avatar.data = {
          encoding: avatarDataResponse.encoding,
          data: avatarDataResponse.data
        };
      });

      // Emit IPC changed event
      EventBus.emit("avatar:changed", { jid, id } as EventAvatarGeneric);

      return avatar;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { EventAvatarGeneric };
export default $avatar;
