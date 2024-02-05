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
import {
  JID,
  Availability,
  PresenceSubRequestId
} from "@prose-im/prose-sdk-js";
import mitt from "mitt";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type PresenceRequests = Array<PresenceRequest>;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Presence {
  requests: PresenceRequests;
}

interface PresenceRequest {
  id: PresenceSubRequestId;
  name: string;
  jid: string;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  requestsLoaded: false
};

const EventBus = mitt();

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $presence = defineStore("presence", {
  persist: false,

  state: (): Presence => {
    return {
      requests: []
    };
  },

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
    },

    getRequests: function () {
      return (): PresenceRequests => {
        return this.requests;
      };
    }
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      return EventBus;
    },

    async loadRequests(reload = false): Promise<PresenceRequests> {
      // Load requests? (or reload)
      if (LOCAL_STATES.requestsLoaded === false || reload === true) {
        LOCAL_STATES.requestsLoaded = true;

        // Load all presence requests
        const subscriptionRequests =
          await Broker.$presence.loadSubscriptionRequests();

        // Generate requests
        const requests: PresenceRequests = subscriptionRequests.map(
          subscriptionRequest => {
            return {
              id: subscriptionRequest.id,
              name: subscriptionRequest.name,
              jid: subscriptionRequest.jid.toString()
            };
          }
        );

        this.$patch(state => {
          state.requests = requests;
        });
      }

      return this.requests;
    },

    marRequestsChanged() {
      EventBus.emit("requests:changed");
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { PresenceRequest };
export default $presence;
