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

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type ProfileEntryName = {
  full?: ProfileEntryNameFull;
  nick?: string;
};

type ProfileEntryNameFull = {
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

const PROFILE_METADATA_EXPIRE_AFTER = 90000; // 90 seconds

const LOCAL_STATES = {
  profileLoaded: {} as { [jid: string]: boolean },
  metadataLoadedAt: {} as { [jid: string]: number }
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

    getProfile(jid: JID): ProfileEntry {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(jid);
    },

    async load(jid: JID, reload = false): Promise<ProfileEntry> {
      // Assert profile data
      const profile = this.assert(jid);

      // Load all profile parts at once
      await Promise.all([
        this.loadUserProfile(jid, reload),
        this.loadUserMetadata(jid, reload)
      ]);

      return profile;
    },

    async loadUserProfile(jid: JID, reload = false): Promise<ProfileEntry> {
      // Assert profile data
      const profile = this.assert(jid),
        jidString = jid.toString();

      // Load profile? (or reload)
      if (LOCAL_STATES.profileLoaded[jidString] !== true || reload === true) {
        // Load vCard data for JID
        const profileResponse = await Broker.$profile.loadUserProfile(jid);

        // Mark profile as loaded
        LOCAL_STATES.profileLoaded[jidString] = true;

        // Set local profile vCard data
        this.setUserProfile(jid, profileResponse);
      }

      return profile;
    },

    async loadUserMetadata(jid: JID, reload = false): Promise<void> {
      const jidString = jid.toString();

      // Check if should reload (never loaded, or expired)
      const nowTime = Date.now(),
        lastLoadedAt = LOCAL_STATES.metadataLoadedAt[jidString] || 0;

      const notLoadedOrExpired =
        nowTime - lastLoadedAt > PROFILE_METADATA_EXPIRE_AFTER;

      // Load metadata? (or reload)
      // Important: do not load metadata if this is our own JID, since it will \
      //   most likely fail due to querying our own local resource, eg. to \
      //   acquire local client time.
      if (
        jid.equals(Store.$account.getSelfJID()) !== true &&
        (notLoadedOrExpired === true || reload === true)
      ) {
        // Load metadata for JID
        const metadata = await Broker.$profile.loadUserMetadata(jid);

        // Mark metadata as loaded
        LOCAL_STATES.metadataLoadedAt[jidString] = nowTime;

        // Set local metadata
        this.setUserMetadata(jid, metadata);
      }
    },

    setUserProfile(jid: JID, userProfile: UserProfile | void): ProfileEntry {
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
          // #1. Store name (full name & nick name)
          profile.name = profile.name || {};

          if (userProfile.firstName || userProfile.lastName) {
            profile.name.full = {
              first: userProfile.firstName || "",
              last: userProfile.lastName || ""
            };
          } else {
            delete profile.name.full;
          }

          if (userProfile.nickname) {
            profile.name.nick = userProfile.nickname;
          } else {
            delete profile.name.nick;
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

    setUserMetadata(jid: JID, metadata: UserMetadata | void) {
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

          profile.security.encryption = {
            // Prose does not allow insecure protocols, therefore we can mark \
            //   the connection as secure here.
            // Important: UNLESS the 'allow insecure' override is NOT toggled \
            //   on, we mark all connections as non-secure by default. If this \
            //   override is not set, then all connections are GUARANTEED to \
            //   be secure.
            secureProtocol:
              CONFIG.overrides?.allowInsecure === true ? false : true
          };

          if (metadata.encryption) {
            profile.security.encryption.messageEndToEndMethod =
              metadata.encryption.messageEndToEndMethod;
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
