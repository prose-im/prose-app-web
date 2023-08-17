/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, UserProfile, UserMetadata } from "@prose-im/prose-sdk-js";
import { defineStore } from "pinia";

// PROJECT: BROKER
import Broker from "@/broker";

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
  secureProtocol?: boolean;
  connectionProtocol?: string;
  messageEndToEndMethod?: string;
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
  persist: false,

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
      const jidString = jid.toString();

      // Assign new profile entry for JID?
      if (!(jidString in this.entries)) {
        this.$patch(state => {
          // Insert empty data
          state.entries[jidString] = {};
        });
      }

      return this.entries[jidString];
    },

    async load(jid: JID, reload = false): Promise<ProfileEntry> {
      // Assert profile data
      const profile = this.assert(jid);
      const jidString = jid.toString();

      // Load profile? (or reload)
      if (LOCAL_STATES.loaded[jidString] !== true || reload === true) {
        LOCAL_STATES.loaded[jidString] = true;

        // Load all profile parts at once
        await Promise.all([
          this.loadUserProfile(jid),
          this.loadUserMetadata(jid)
        ]);
      }

      return Promise.resolve(profile);
    },

    async loadUserProfile(jid: JID): Promise<ProfileEntry> {
      // Load vCard data for JID
      const profileResponse = await Broker.$profile.loadUserProfile(jid);

      // Set local profile vCard data
      return this.setUserProfile(jid, profileResponse);
    },

    async loadUserMetadata(jid: JID): Promise<void> {
      const metadata = await Broker.$profile.loadUserMetadata(jid);

      this.setUserMetadata(jid, metadata);
    },

    setUserProfile(jid: JID, userProfile?: UserProfile): ProfileEntry {
      const profile = this.assert(jid),
        information = this.ensureProfileInformation(profile);

      // Reset or update user profile?
      if (!userProfile) {
        // Reset data in store
        this.$patch(() => {
          delete profile.name;
          delete profile.employment;

          information.contact.email = null;
          information.contact.phone = null;
          information.location.city = null;
          information.location.country = null;
        });
      } else {
        // Update data in store
        this.$patch(() => {
          // #1. Store name
          if (userProfile.firstName || userProfile.lastName) {
            profile.name = {
              first: userProfile.firstName || "",
              last: userProfile.lastName || ""
            };
          } else {
            delete profile.name;
          }

          // #2. Store employment
          if (
            userProfile.job &&
            (userProfile.job.title ||
              userProfile.job.role ||
              userProfile.job.organization)
          ) {
            profile.employment = {};

            if (userProfile.job.title) {
              profile.employment.title = userProfile.job.title;
            } else if (userProfile.job.role) {
              profile.employment.title = userProfile.job.role;
            }

            if (userProfile.job.organization) {
              profile.employment.organization = userProfile.job.organization;
            }
          } else {
            delete profile.employment;
          }

          // #3. Store information
          information.contact.email = userProfile.email || null;
          information.contact.phone = userProfile.phone || null;

          information.location.city = userProfile.address?.city || null;
          information.location.country = userProfile.address?.country || null;
        });
      }

      return profile;
    },

    setUserMetadata(jid: JID, metadata: UserMetadata | undefined) {
      const profile = this.assert(jid),
        information = this.ensureProfileInformation(profile),
        location = this.ensureProfileInformationLocation(information);

      // Reset or update user metadata?
      if (!metadata) {
        // Reset data in store
        this.$patch(() => {
          information.lastActive = null;
          location.timezone = null;

          profile.security = profile.security || {};

          delete profile.security.verification;
          delete profile.security.encryption;
        });
      } else {
        // Update data in store
        this.$patch(() => {
          // #1. Store last activity + local time
          if (metadata.lastActivity) {
            information.lastActive = {
              timestamp: Number(metadata.lastActivity.utcTimestamp) * 1000
            };
          } else {
            information.lastActive = null;
          }

          if (metadata.localTime) {
            location.timezone = {
              name: metadata.localTime.formattedTimezoneOffset,
              offset: metadata.localTime.timezoneOffset / 60
            };
          } else {
            location.timezone = null;
          }

          // #2. Store security details
          profile.security = profile.security || {};

          if (metadata.verification) {
            profile.security.verification = {
              fingerprint: metadata.verification.fingerprint || null,
              email: metadata.verification.email || null,
              phone: metadata.verification.phone || null,
              identity: metadata.verification.identity || null
            };
          } else {
            delete profile.security.verification;
          }

          if (metadata.encryption) {
            profile.security.encryption = {
              secureProtocol: metadata.encryption.secureProtocol,
              connectionProtocol: metadata.encryption.connectionProtocol,
              messageEndToEndMethod: metadata.encryption.messageEndToEndMethod
            };
          } else {
            delete profile.security.encryption;
          }
        });
      }
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

export type {
  ProfileEntry,
  ProfileEntryInformationContact,
  ProfileEntrySecurityEncryption
};
export default $profile;
