/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, Availability } from "@prose-im/prose-sdk-js";
import { defineStore } from "pinia";

// PROJECT: STORES
import Store from "@/store";
import Broker from "@/broker";

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
        if (Broker.client.jid && Broker.client.jid.equals(jid)) {
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
