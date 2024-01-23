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
import { Availability, JID } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $presence = defineStore("presence", {
  persist: false,

  getters: {
    getAvailability: function () {
      return (jid: JID): Availability => {
        // Notice: this method is a convenience method, which sources the \
        //   availability for the given JID from the most relevant data \
        //   source, which is found in another store.

        // Obtain availability for self account
        if (Store.$account.getSelfJID().equals(jid) === true) {
          return Store.$account.getInformationAvailability();
        }

        // Obtain availability for roster contact
        return (
          Store.$roster.getEntry(jid)?.availability || Availability.Unavailable
        );
      };
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $presence;
