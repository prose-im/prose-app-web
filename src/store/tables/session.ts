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

const $session = defineStore("session", {
  // Important: DO NOT persist this store, as it contains session-related data.
  persist: false,

  state: () => {
    return {
      connected: false
    };
  },

  actions: {
    setConnected(connected: boolean) {
      this.$patch({
        connected
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $session;
