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
import { JID } from "@prose-im/prose-sdk-js";

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
        // Notice: use last JID as a fallback, as during logout the UI still \
        //   requires the JID value, although it is in process of being reset. \
        //   The last JID is supposed to of the exact same value as the JID \
        //   from the credentials object.
        const localJID = this.credentials.jid || this.last.jid || null;

        if (localJID === null) {
          throw new Error(
            "No JID defined in credentials (this should never happen)"
          );
        }

        return new JID(localJID);
      };
    }
  },

  actions: {
    async login(
      rawJID: string,
      password: string,
      remember = true
    ): Promise<void> {
      let jid: JID;

      try {
        jid = new JID(rawJID);
      } catch (e) {
        throw new Error("Please provide a valid Jabber ID");
      }

      // Connect and authenticate to server
      await Broker.client.authenticate(jid, password);

      // Store credentials? (if success)
      if (remember === true) {
        this.$patch(state => {
          // Assign account credentials
          state.credentials.jid = rawJID;
          state.credentials.password = password;

          // Assign last account marker
          state.last.jid = rawJID;
          state.last.timestamp = Date.now();
        });
      }
    },

    async logout() {
      // Disconnect from server
      Broker.client.logout();

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
