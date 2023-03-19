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
      return (jid: JID) => state[jid.toString()] || null;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $avatar;
