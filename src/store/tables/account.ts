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
import { jid, JID } from "@xmpp/jid";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $account = defineStore("account", {
  persist: true,

  state: () => {
    return {
      credentials: {
        jid: "",
        password: "" // TODO: password is stored in the clear, this is insecure
      },

      last: {
        jid: "",
        timestamp: -1
      }
    };
  },

  getters: {
    getLocalJID: function () {
      return (): JID => {
        if (!this.credentials.jid) {
          throw new Error(
            "No JID defined in credentials (this should never happen)"
          );
        }

        return jid(this.credentials.jid);
      };
    }
  },

  actions: {
    async login(
      rawJid: string,
      password: string,
      remember = true
    ): Promise<void> {
      // Connect and authenticate to server
      await Broker.client.authenticate(jid(rawJid), password);

      // Store credentials? (if success)
      if (remember === true) {
        this.$patch(state => {
          // Assign account credentials
          state.credentials.jid = rawJid;
          state.credentials.password = password;

          // Assign last account marker
          state.last.jid = rawJid;
          state.last.timestamp = Date.now();
        });
      }
    },

    async logout() {
      // TODO: disconnect from broker

      // Clear stored credentials
      // Notice: retain last JID for later quick-login
      this.$patch(state => {
        state.credentials.jid = "";
        state.credentials.password = "";
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $account;
