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
  LoadLastActivityResponse
} from "@/broker/modules/profile";

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
          this.loadProfileActivity(bareJID, fullJIDHighest),
          this.loadProfileVerification(bareJID),
          this.loadProfileEncryption(bareJID)
        ]);
      }

      return Promise.resolve(profile);
    },

    async loadProfileVCard(bareJID: JID): Promise<void> {
      // Load vCard data for JID
      const profileResponse = await Broker.$profile.loadVCard(bareJID);

      // Set local profile vCard data
      this.setProfileVCard(bareJID, profileResponse);
    },

    async loadProfileLast(bareJID: JID, fullJIDHighest: JID): Promise<void> {
      // Load last activity time
      // TODO: only if remote client supports it (w/ CAPS)
      const lastActivityResponse = await Broker.$profile.loadLastActivity(
        fullJIDHighest
      );

      // Set local profile last active time
      this.setProfileLast(bareJID, lastActivityResponse);
    },

    async loadProfileTime(bareJID: JID, fullJIDHighest: JID): Promise<void> {
      // Load user timezone
      // TODO: only if remote client supports it (w/ CAPS)
      const entityTimeResponse = await Broker.$profile.loadEntityTime(
        fullJIDHighest
      );

      // Set local profile time
      this.setProfileTime(bareJID, entityTimeResponse.tzo);
    },

    async loadProfileActivity(
      bareJID: JID,
      fullJIDHighest: JID
    ): Promise<void> {
      // Load user activity
      // TODO: only if remote client supports it (w/ CAPS)
      // TODO: load activity on fullJIDHighest (??)

      // Set local profile activity
      // TODO: from server data
      this.setProfileActivity(bareJID, "Focusing on code", "👨‍💻");
    },

    async loadProfileVerification(bareJID: JID): Promise<void> {
      // Set local profile verification status
      // TODO: from server data
      this.setProfileVerification(bareJID, {
        fingerprint: "0000",
        email: bareJID.toString(),
        phone: null,
        identity: null
      });
    },

    async loadProfileEncryption(bareJID: JID): Promise<void> {
      // Set local profile encryption status
      // TODO: from server data
      this.setProfileEncryption(bareJID, {
        connectionProtocol: "TLS1.3",
        messageEndToEndMethod: "OMEMO"
      });
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

    setProfileTime(jid: JID, tzo: string | null): ProfileEntry {
      const profile = this.assert(jid),
        information = this.ensureProfileInformation(profile),
        location = this.ensureProfileInformationLocation(information);

      // Update data in store
      this.$patch(() => {
        // TODO: also assign converted offset
        location.timezone = tzo !== null ? `UTC${tzo}` : null;
      });

      return profile;
    },

    setProfileActivity(
      jid: JID,
      text: string,
      icon: string | null
    ): ProfileEntry {
      const profile = this.assert(jid),
        information = this.ensureProfileInformation(profile);

      // Update data in store
      this.$patch(() => {
        information.activity = information.activity || {
          icon: null,
          text: ""
        };

        // TODO: set icon from activity text
        information.activity.icon = icon;
        information.activity.text = text;
      });

      return profile;
    },

    setProfileVerification(
      jid: JID,
      verification: ProfileEntrySecurityVerification
    ): ProfileEntry {
      const profile = this.assert(jid);

      // Update data in store
      this.$patch(() => {
        profile.security = profile.security || {};

        profile.security.verification = {
          fingerprint: verification.fingerprint,
          email: verification.email,
          phone: verification.phone,
          identity: verification.identity
        };
      });

      return profile;
    },

    setProfileEncryption(
      jid: JID,
      encryption: ProfileEntrySecurityEncryption
    ): ProfileEntry {
      const profile = this.assert(jid);

      // Update data in store
      this.$patch(() => {
        profile.security = profile.security || {};

        profile.security.encryption = {
          connectionProtocol: encryption.connectionProtocol,
          messageEndToEndMethod: encryption.messageEndToEndMethod
        };
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

          lastActive: null,
          activity: null
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

export default $profile;
