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

// PROJECT: BROKER
import BrokerClient from "@/broker/client";

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
    async login(jid: string, password: string, remember = true): Promise<void> {
      // Connect and authenticate to server
      await BrokerClient.authenticate(jid, password);

      // Store credentials? (if success)
      if (remember === true) {
        this.$patch(state => {
          state.credentials.jid = jid;
          state.credentials.password = password;
        });
      }
    },

    logout() {
      // TODO: disconnect

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
