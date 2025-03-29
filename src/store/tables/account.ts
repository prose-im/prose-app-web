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
import { InboxNameOrigin } from "@/store/tables/inbox";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import UtilitiesRuntime from "@/utilities/runtime";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Account {
  credentials: {
    jid: string;
    password: string;
  };

  last: {
    jid: string;
    timestamp: number;
  };

  information: {
    jid: string;
    name: string;
    availability: Availability;
  };

  team: {
    name: string;
    accent: AccountTeamAccent;
  };
}

interface AccountTeamAccent {
  background: string;
  text: string;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  informationLoaded: false,
  teamLoaded: false
};

const INFORMATION_AVAILABILITY_DEFAULT = Availability.Available;

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $account = defineStore("account", {
  persist: true,

  state: (): Account => {
    return {
      credentials: {
        jid: "",
        password: "" // TODO: password is stored in the clear, this is insecure
      },

      last: {
        jid: "",
        timestamp: -1
      },

      information: {
        jid: "",
        name: "",
        availability: INFORMATION_AVAILABILITY_DEFAULT
      },

      team: {
        name: "",

        accent: {
          background: "",
          text: ""
        }
      }
    };
  },

  getters: {
    getSelfJID: function () {
      return (): JID => {
        // Notice: use last JID as a fallback, as during logout the UI still \
        //   requires the JID value, although it is in process of being reset. \
        //   The last JID is supposed to of the exact same value as the JID \
        //   from the credentials object, but we always prefer to use the one \
        //   served from the core client library once account information have \
        //   been fully obtained, as the source of truth.
        const selfJID =
          this.information.jid || this.credentials.jid || this.last.jid || null;

        if (selfJID === null) {
          throw new Error(
            "No self JID could be acquired (this should never happen)"
          );
        }

        return new JID(selfJID);
      };
    },

    getInformationName: function () {
      return (): string => {
        return this.information.name;
      };
    },

    getInformationAvailability: function () {
      return (): Availability => {
        return this.information.availability;
      };
    },

    getTeamName: function () {
      return (): string => {
        return this.team.name;
      };
    },

    getTeamAccent: function () {
      return (): AccountTeamAccent => {
        return this.team.accent;
      };
    }
  },

  actions: {
    async login(
      rawJID: string,
      password: string,
      remember = true
    ): Promise<void> {
      let jid: JID;

      try {
        jid = new JID(rawJID);
      } catch (_) {
        throw new Error("Please provide a valid Jabber ID");
      }

      // Connect and authenticate to server
      // Important: disable reconnect retries on failure by marking as \
      //   'attempt once only' here.
      await Broker.client.authenticate(jid, password, true);

      // Store credentials? (if success)
      if (remember === true) {
        this.$patch(state => {
          // Assign account credentials
          state.credentials.jid = rawJID;
          state.credentials.password = password;

          // Assign last account marker
          state.last.jid = rawJID;
          state.last.timestamp = Date.now();
        });
      }

      // Load local user profile and check if should show onboarding
      try {
        const profile = await Broker.$profile.loadUserProfile(jid);

        // No profile first/last name set? (or profile is completely empty)
        if (
          profile === undefined ||
          (!profile.firstName && !profile.lastName)
        ) {
          Store.$session.setOnboardingWelcome(true);
        }
      } catch (error) {
        // Ignore profile load errors (this is not mandatory for login to \
        //   succeed)
        logger.error(
          `Failed loading local user profile after logging in (ignoring error)`,
          error
        );
      }
    },

    async logout(purge = false) {
      // Disconnect from server
      Broker.client.logout(purge);

      // Reset unread count
      UtilitiesRuntime.requestUnreadCountUpdate(0);

      // Clear stored credentials and information
      // Notice: retain last JID for later quick-login
      this.$patch(state => {
        // Clear credentials
        state.credentials.jid = "";
        state.credentials.password = "";

        // Clear information
        state.information.jid = "";
        state.information.name = "";
        state.information.availability = INFORMATION_AVAILABILITY_DEFAULT;

        // Clear team
        state.team.name = "";
        state.team.accent.background = "";
        state.team.accent.text = "";
      });
    },

    async loadInformation(reload = false): Promise<void> {
      // Load information? (or reload)
      if (LOCAL_STATES.informationLoaded === false || reload === true) {
        // Load account information
        const accountInfo = await Broker.$account.loadAccountInfo();

        if (accountInfo) {
          // Update stored JID, name and availability
          this.setInformationJID(accountInfo.jid);
          this.setInformationName(accountInfo.name);
          this.setInformationAvailability(accountInfo.availability);

          // Update account avatar
          // Notice: this is a cross-store operation, for convenience.
          if (accountInfo.avatar !== undefined) {
            Store.$avatar.refresh(
              accountInfo.jid.toString(),
              accountInfo.avatar
            );
          }

          // Update stored activity
          // Notice: this is a cross-store operation, for convenience.
          Store.$activity.setActivity(accountInfo.jid, accountInfo.status);

          // Re-register name in all rooms (as needed)
          // Notice: this is a cross-store operation, for convenience.
          const jidString = accountInfo.jid.toString();

          Store.$inbox.getRooms().forEach(roomId => {
            Store.$inbox.setName(
              roomId,
              jidString,
              accountInfo.name,
              InboxNameOrigin.Global
            );
          });
        }

        // Mark as loaded
        LOCAL_STATES.informationLoaded = true;
      }
    },

    async loadTeam(reload = false): Promise<void> {
      // Load team? (or reload)
      if (LOCAL_STATES.teamLoaded === false || reload === true) {
        // Load team information
        // TODO: load, remove those fixtures!
        const teamInfo = await Promise.resolve({
          domain: "prose.org.local",
          name: "Prose Dev",
          accentBackground: "#2490f0",
          accentText: "#ffffff",
          avatar: undefined
        });

        if (teamInfo) {
          // Update stored team information
          this.setTeamName(teamInfo.name);

          this.setTeamAccent({
            background: teamInfo.accentBackground,
            text: teamInfo.accentText
          });

          // Update team avatar
          // Notice: this is a cross-store operation, for convenience.
          if (teamInfo.avatar !== undefined) {
            Store.$avatar.refresh(teamInfo.domain, teamInfo.avatar);
          }
        }

        // Mark as loaded
        LOCAL_STATES.teamLoaded = true;
      }
    },

    setCredentialsPassword(password: string): void {
      this.$patch(() => {
        this.credentials.password = password;
      });
    },

    setInformationJID(jid: JID): void {
      this.$patch(() => {
        this.information.jid = jid.toString();
      });
    },

    setInformationName(name: string): void {
      this.$patch(() => {
        this.information.name = name;
      });
    },

    setInformationAvailability(availability: Availability): void {
      this.$patch(() => {
        this.information.availability = availability;
      });
    },

    setTeamName(name: string): void {
      this.$patch(() => {
        this.team.name = name;
      });
    },

    setTeamAccent(accent: AccountTeamAccent): void {
      this.$patch(() => {
        this.team.accent = accent;
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { AccountTeamAccent };
export default $account;
