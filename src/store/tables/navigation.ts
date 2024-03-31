/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { defineStore } from "pinia";

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $navigation = defineStore("navigation", {
  persist: true,

  state: () => {
    return {
      inbox: {
        lastRoomId: null as string | null
      }
    };
  },

  actions: {
    setInboxLastRoomId(roomId: string | null) {
      // Update value? (if changed)
      if (roomId !== this.inbox.lastRoomId) {
        this.$patch(state => {
          state.inbox.lastRoomId = roomId;
        });
      }
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $navigation;
