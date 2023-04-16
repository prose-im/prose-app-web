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

// PROJECT: BROKER
import Broker from "@/broker";
import { LoadAvatarResponse } from "@/broker/modules/profile";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type AvatarEntryMeta = {
  id: string;
  type: string;
};

type AvatarEntryData = {
  encoding: string;
  data: string;
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
  meta: AvatarEntryMeta;
  data: AvatarEntryData;
}

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
  persist: true,

  state: (): Avatar => {
    return {
      entries: {}
    };
  },

  getters: {
    getAvatar: (state: Avatar) => {
      return (jid: JID): AvatarEntry | void => {
        const bareJIDString = jid.bare().toString();

        return state.entries[bareJIDString] || undefined;
      };
    }
  },

  actions: {
    async load(jid: JID, reload = false): Promise<AvatarEntry | void> {
      // Read cached avatar
      let avatar = this.getAvatar(jid);

      // TODO
      console.error(`==> store.$avatar.load(${jid.toString()}) : check`);

      // Load avatar? (or reload)
      if (avatar === undefined || reload === true) {
        // TODO
        console.error(`==> store.$avatar.load(${jid.toString()}) : proceed`);

        const bareJIDString = jid.bare().toString();

        // Not already loading? Load now.
        if (LOCAL_STATES.loading[bareJIDString] !== true) {
          // Mark as loading
          LOCAL_STATES.loading[bareJIDString] = true;

          // TODO
          // TODO: once loaded, unstack state

          const avatarResponse = await Broker.$profile.loadAvatar(jid);

          // Store avatar
          avatar = this.setAvatar(jid, avatarResponse);

          // TODO
          console.error(
            "==> avatar/loaded : " + bareJIDString,
            JSON.stringify(avatar)
          );

          // Remove loading marker
          delete LOCAL_STATES.loading[bareJIDString];
        } else {
          // TODO: return stacked return promise
        }
      } else {
        // TODO
        console.error(
          "==> avatar/cached : " + jid.bare().toString(),
          JSON.stringify(avatar)
        );
      }

      return Promise.resolve(avatar);
    },

    async updateMetadata(jid: JID, id: string): Promise<AvatarEntry | void> {
      // Read cached avatar
      const avatar = this.getAvatar(jid);

      // Reload avatar? (w/ updated metadata, only if avatar had been loaded)
      if (avatar && avatar.meta.id !== id) {
        return this.load(jid, true);
      }

      return Promise.resolve(avatar);
    },

    setAvatar(jid: JID, avatarResponse: LoadAvatarResponse): AvatarEntry {
      const bareJIDString = jid.bare().toString();

      this.$patch(() => {
        this.entries[bareJIDString] = {
          meta: {
            id: avatarResponse.meta.id,
            type: avatarResponse.meta.type
          },

          data: {
            encoding: avatarResponse.data.encoding,
            data: avatarResponse.data.data
          }
        } as AvatarEntry;
      });

      return this.entries[bareJIDString];
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $avatar;
