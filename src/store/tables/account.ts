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
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const StoreTableAccount = defineStore("account", {
  persist: true,

  state: () => {
    return {
      credentials: {
        jid: "",
        password: "" // TODO: password is stored in the clear, this is insecure
      }
    };
  },

  actions: {
    async login(jid: JID, password: string, remember = true): Promise<void> {
      // Connect and authenticate to server
      await Broker.client.authenticate(jid, password);

      // Store credentials? (if success)
      if (remember === true) {
        this.$patch(state => {
          state.credentials.jid = jid.toString();
          state.credentials.password = password;
        });
      }
    },

    async logout() {
      // TODO: disconnect from broker

      // Clear stored credentials
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

export default StoreTableAccount;
