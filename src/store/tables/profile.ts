/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID } from "@xmpp/jid";
import { defineStore } from "pinia";

// PROJECT: BROKER
import Broker from "@/broker";
import { LoadVCardResponse } from "@/broker/modules/profile";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type ProfileEntryName = {
  first: string;
  last: string;
};

type ProfileEntryInformation = {
  contact: ProfileEntryInformationContact;
  lastActive: ProfileEntryInformationLastActive | null;
  location: ProfileEntryInformationLocation;
  activity: ProfileEntryInformationActivity | null;
};

type ProfileEntryInformationContact = {
  email: string | null;
  phone: string | null;
};

type ProfileEntryInformationLastActive = {
  timestamp: number | null;
};

type ProfileEntryInformationLocation = {
  city: string | null;
  country: string | null;
  timezone: string | null;
};

type ProfileEntryInformationActivity = {
  icon: string | null;
  text: string;
};

type ProfileEntrySecurity = {
  verification: ProfileEntrySecurityVerification | null;
  encryption: ProfileEntrySecurityEncryption | null;
};

type ProfileEntrySecurityVerification = {
  fingerprint: string | null;
  email: string | null;
  phone: string | null;
  identity: string | null;
};

type ProfileEntrySecurityEncryption = {
  connectionProtocol: string;
  messageEndToEndMethod: string;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Profile {
  entries: ProfileEntries;
}

interface ProfileEntries {
  [jid: string]: ProfileEntry;
}

interface ProfileEntry {
  name?: ProfileEntryName;
  role?: string;
  information?: ProfileEntryInformation;
  security?: ProfileEntrySecurity;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  loaded: {} as { [jid: string]: boolean }
};

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $profile = defineStore("profile", {
  persist: true,

  state: (): Profile => {
    return {
      entries: {}
    };
  },

  getters: {
    getProfile: function () {
      return (jid: JID): ProfileEntry => {
        return this.assert(jid);
      };
    }
  },

  actions: {
    assert(jid: JID): ProfileEntry {
      const bareJIDString = jid.bare().toString();

      // Assign new profile entry for JID?
      if (!(bareJIDString in this.entries)) {
        this.$patch(() => {
          // Insert empty data
          this.entries[bareJIDString] = {};
        });
      }

      return this.entries[bareJIDString];
    },

    async load(jid: JID, reload = false): Promise<ProfileEntry> {
      // Assert profile data
      const profile = this.assert(jid);

      const bareJIDString = jid.bare().toString();

      // Load profile? (or reload)
      if (LOCAL_STATES.loaded[bareJIDString] !== true || reload === true) {
        LOCAL_STATES.loaded[bareJIDString] = true;

        // Load profile for JID
        // TODO: do all of them at once (as a race between all promises, set \
        //   data in store asap it is received on the network)
        const profileResponse = await Broker.$profile.loadVCard(jid);

        // TODO: load last active time
        // TODO: load timezone
        // TODO: load activity
        // TODO: load verification status
        // TODO: load encryption status

        // Set local profile vCard data
        this.setProfileVCard(jid, profileResponse);
      }

      return Promise.resolve(profile);
    },

    setProfileVCard(jid: JID, vCardResponse: LoadVCardResponse): ProfileEntry {
      const profile = this.assert(jid);

      // Update data in store
      this.$patch(() => {
        // #1. Store name
        if (vCardResponse.firstName || vCardResponse.lastName) {
          profile.name = {
            first: vCardResponse.firstName || "",
            last: vCardResponse.lastName || ""
          };
        } else if (vCardResponse.fullName) {
          const fullNameSplit = vCardResponse.fullName.split(" ");

          profile.name = {
            first: fullNameSplit[0] || "",
            last: fullNameSplit[1] || ""
          };
        } else {
          delete profile.name;
        }

        // #2. Store role
        if (vCardResponse.job) {
          const roleParts = [];

          if (vCardResponse.job.title) {
            roleParts.push(vCardResponse.job.title);
          } else if (vCardResponse.job.role) {
            roleParts.push(vCardResponse.job.role);
          }

          if (vCardResponse.job.organization) {
            roleParts.push(vCardResponse.job.organization);
          }

          profile.role = roleParts.join(", ");
        } else {
          delete profile.role;
        }

        // #3. Store information
        profile.information = profile.information || {
          contact: {
            email: null,
            phone: null
          },

          location: {
            city: null,
            country: null,
            timezone: null
          },

          lastActive: null,
          activity: null
        };

        profile.information.contact.email = vCardResponse.email || null;
        profile.information.contact.phone = vCardResponse.phone || null;

        profile.information.location.city = vCardResponse.address?.city || null;
        profile.information.location.country =
          vCardResponse.address?.country || null;
      });

      return profile;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $profile;
