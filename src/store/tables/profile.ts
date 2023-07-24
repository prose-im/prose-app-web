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
import {
  LoadVCardResponse,
  LoadLastActivityResponse,
  LoadEntityTimeResponse
} from "@/broker/modules/profile";

// PROJECT: FILTERS
import dateFilters from "@/filters/date";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type ProfileEntryName = {
  first: string;
  last: string;
};

type ProfileEntryEmployment = {
  title?: string;
  organization?: string;
};

type ProfileEntryInformation = {
  contact: ProfileEntryInformationContact;
  lastActive: ProfileEntryInformationLastActive | null;
  location: ProfileEntryInformationLocation;
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
  timezone: ProfileEntryInformationLocationTimezone | null;
};

type ProfileEntryInformationLocationTimezone = {
  name: string;
  offset: number;
};

type ProfileEntrySecurity = {
  verification?: ProfileEntrySecurityVerification;
  encryption?: ProfileEntrySecurityEncryption;
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
  employment?: ProfileEntryEmployment;
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
        this.$patch(state => {
          // Insert empty data
          state.entries[bareJIDString] = {};
        });
      }

      return this.entries[bareJIDString];
    },

    async load(fullJIDHighest: JID, reload = false): Promise<ProfileEntry> {
      // Assert profile data
      const profile = this.assert(fullJIDHighest);

      const bareJID = fullJIDHighest.bare(),
        bareJIDString = bareJID.toString();

      // Load profile? (or reload)
      if (LOCAL_STATES.loaded[bareJIDString] !== true || reload === true) {
        LOCAL_STATES.loaded[bareJIDString] = true;

        // Load all profile parts at once
        await Promise.all([
          this.loadProfileVCard(bareJID),
          this.loadProfileLast(bareJID, fullJIDHighest),
          this.loadProfileTime(bareJID, fullJIDHighest),
          this.loadProfileVerification(bareJID),
          this.loadProfileEncryption(bareJID)
        ]);
      }

      return Promise.resolve(profile);
    },

    async loadProfileVCard(bareJID: JID): Promise<ProfileEntry> {
      // Load vCard data for JID
      const profileResponse = await Broker.$profile.loadVCard(bareJID);

      // Set local profile vCard data
      return this.setProfileVCard(bareJID, profileResponse);
    },

    async loadProfileLast(
      bareJID: JID,
      fullJIDHighest: JID
    ): Promise<ProfileEntry> {
      // Load last activity time
      // TODO: only if remote client supports it (w/ CAPS)
      const lastActivityResponse = await Broker.$profile.loadLastActivity(
        fullJIDHighest
      );

      // Set local profile last active time
      return this.setProfileLast(bareJID, lastActivityResponse);
    },

    async loadProfileTime(
      bareJID: JID,
      fullJIDHighest: JID
    ): Promise<ProfileEntry> {
      // Load user timezone
      // TODO: only if remote client supports it (w/ CAPS)
      const entityTimeResponse = await Broker.$profile.loadEntityTime(
        fullJIDHighest
      );

      // Set local profile time
      return this.setProfileTime(bareJID, entityTimeResponse);
    },

    async loadProfileVerification(bareJID: JID): Promise<ProfileEntry> {
      // Set local profile verification status
      // TODO: from server data
      // return this.setProfileVerification(bareJID, {
      //   fingerprint: "0000",
      //   email: bareJID.toString(),
      //   phone: null,
      //   identity: null
      // });

      return this.setProfileVerification(bareJID, undefined);
    },

    async loadProfileEncryption(bareJID: JID): Promise<ProfileEntry> {
      // Set local profile encryption status
      // TODO: from server data
      // return this.setProfileEncryption(bareJID, {
      //   connectionProtocol: "TLS1.3",
      //   messageEndToEndMethod: "OMEMO"
      // });

      return this.setProfileEncryption(bareJID, undefined);
    },

    setProfileVCard(jid: JID, vCardResponse: LoadVCardResponse): ProfileEntry {
      const profile = this.assert(jid),
        information = this.ensureProfileInformation(profile);

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

        // #2. Store employment
        if (
          vCardResponse.job &&
          (vCardResponse.job.title ||
            vCardResponse.job.role ||
            vCardResponse.job.organization)
        ) {
          profile.employment = {};

          if (vCardResponse.job.title) {
            profile.employment.title = vCardResponse.job.title;
          } else if (vCardResponse.job.role) {
            profile.employment.title = vCardResponse.job.role;
          }

          if (vCardResponse.job.organization) {
            profile.employment.organization = vCardResponse.job.organization;
          }
        } else {
          delete profile.employment;
        }

        // #3. Store information
        information.contact.email = vCardResponse.email || null;
        information.contact.phone = vCardResponse.phone || null;

        information.location.city = vCardResponse.address?.city || null;
        information.location.country = vCardResponse.address?.country || null;
      });

      return profile;
    },

    setProfileLast(
      jid: JID,
      lastActivityResponse: LoadLastActivityResponse
    ): ProfileEntry {
      const profile = this.assert(jid),
        information = this.ensureProfileInformation(profile);

      // Update data in store
      this.$patch(() => {
        information.lastActive = {
          timestamp: lastActivityResponse.timestamp
        };
      });

      return profile;
    },

    setProfileTime(
      jid: JID,
      entityTimeResponse: LoadEntityTimeResponse
    ): ProfileEntry {
      const profile = this.assert(jid),
        information = this.ensureProfileInformation(profile),
        location = this.ensureProfileInformationLocation(information);

      // Update data in store
      this.$patch(() => {
        if (entityTimeResponse.tzo !== null) {
          location.timezone = {
            name: `UTC${entityTimeResponse.tzo}`,
            offset: dateFilters.tzoToOffset(entityTimeResponse.tzo)
          };
        } else {
          location.timezone = null;
        }
      });

      return profile;
    },

    setProfileVerification(
      jid: JID,
      verification?: ProfileEntrySecurityVerification
    ): ProfileEntry {
      const profile = this.assert(jid);

      // Update data in store
      this.$patch(() => {
        profile.security = profile.security || {};

        if (verification !== undefined) {
          profile.security.verification = {
            fingerprint: verification.fingerprint,
            email: verification.email,
            phone: verification.phone,
            identity: verification.identity
          };
        } else {
          delete profile.security.verification;
        }
      });

      return profile;
    },

    setProfileEncryption(
      jid: JID,
      encryption?: ProfileEntrySecurityEncryption
    ): ProfileEntry {
      const profile = this.assert(jid);

      // Update data in store
      this.$patch(() => {
        profile.security = profile.security || {};

        if (encryption !== undefined) {
          profile.security.encryption = {
            connectionProtocol: encryption.connectionProtocol,
            messageEndToEndMethod: encryption.messageEndToEndMethod
          };
        } else {
          delete profile.security.encryption;
        }
      });

      return profile;
    },

    ensureProfileInformation(profile: ProfileEntry): ProfileEntryInformation {
      // Initialize empty profile information?
      if (!profile.information) {
        profile.information = {
          contact: {
            email: null,
            phone: null
          },

          location: {
            city: null,
            country: null,
            timezone: null
          },

          lastActive: null
        };
      }

      return profile.information;
    },

    ensureProfileInformationLocation(
      information: ProfileEntryInformation
    ): ProfileEntryInformationLocation {
      // Initialize empty profile information location?
      if (!information.location) {
        information.location = {
          city: null,
          country: null,
          timezone: null
        };
      }

      return information.location;
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { ProfileEntry, ProfileEntryInformationContact };
export default $profile;
