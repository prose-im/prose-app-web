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

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type AvatarEntryData = string;

type AvatarEntryMetadata = {
  id: string;
  type: string;
  bytes: number;
  height: number;
  width: number;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Avatar {
  [jid: string]: AvatarEntry;
}

interface AvatarEntry {
  metadata: AvatarEntryMetadata;
  data: AvatarEntryData;
}

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $avatar = defineStore("avatar", {
  persist: true,

  state: (): Avatar => {
    return {};
  },

  getters: {
    getAvatar: (state: Avatar) => {
      return (jid: JID): AvatarEntry | void => {
        // TODO: need to assert from there? (maybe?)
        // this.assertAvatar(jid);

        state[jid.toString()] || null;
      };
    }
  },

  actions: {
    async assertAvatar(jid: JID, reload = false): Promise<AvatarEntry | void> {
      // Read cached avatar
      const avatar = this.getAvatar(jid);

      // Load avatar? (or reload)
      if (!avatar || reload === true) {
        // TODO
      }

      return Promise.resolve(avatar);
    },

    async updateMetadata(jid: JID, id: string): Promise<AvatarEntry | void> {
      // Read cached avatar
      const avatar = this.getAvatar(jid);

      // Reload avatar? (w/ updated metadata, only if avatar had been loaded)
      if (avatar && avatar.metadata.id !== id) {
        return this.assertAvatar(jid, true);
      }

      return Promise.resolve(avatar);
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $avatar;
