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
import Broker from "@/broker";
import Store from "@/store";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Presence {
  local: PresenceLocal;
}

interface PresenceLocal {
  availability: Availability;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const AVAILABILITY_DEFAULT = Availability.Available;

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $presence = defineStore("presence", {
  persist: true,

  state: (): Presence => {
    return {
      local: { availability: AVAILABILITY_DEFAULT }
    };
  },

  getters: {
    getLocalAvailability: function () {
      return (): Availability => {
        return this.local.availability;
      };
    },

    getAvailability: function () {
      return (jid: JID): Availability => {
        if (Broker.client.jid && Broker.client.jid.equals(jid) === true) {
          return this.getLocalAvailability();
        }

        return (
          Store.$roster.getEntry(jid)?.availability || AVAILABILITY_DEFAULT
        );
      };
    }
  },

  actions: {
    setLocalAvailability(availability: Availability): void {
      this.local.availability = availability;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $presence;
