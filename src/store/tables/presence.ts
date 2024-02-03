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
        const availabilityOrNone = this.getAvailabilityOrNone(jid);

        // Return availability (or default)
        return availabilityOrNone !== undefined
          ? availabilityOrNone
          : Availability.Unavailable;
      };
    },

    getAvailabilityOrNone: function () {
      return (jid: JID): Availability | void => {
        // Notice: this method is a convenience method, which sources the \
        //   availability for the given JID from the most relevant data \
        //   source, which is found in another store.

        // Obtain availability for self account
        if (Store.$account.getSelfJID().equals(jid) === true) {
          return Store.$account.getInformationAvailability();
        }

        // Obtain availability for roster contact
        const rosterContactsEntry = Store.$roster.getContactsEntry(jid);

        if (rosterContactsEntry !== undefined) {
          return rosterContactsEntry.availability;
        }

        // Availability is unknown (do not return default here)
        return undefined;
      };
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $presence;
