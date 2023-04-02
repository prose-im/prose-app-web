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

const $layout = defineStore("layout", {
  persist: true,

  state: () => {
    return {
      inbox: {
        userinfo: false
      }
    };
  },

  actions: {
    toggleInboxUserinfo() {
      this.$patch(state => {
        state.inbox.userinfo = !state.inbox.userinfo;
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $layout;
