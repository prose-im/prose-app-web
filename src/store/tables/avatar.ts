/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  Avatar as CoreProfileAvatar,
  WorkspaceIcon as CoreWorkspaceIcon
} from "@prose-im/prose-sdk-js";
import { defineStore } from "pinia";
import mitt from "mitt";

// PROJECT: BROKER
import Broker from "@/broker";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum AvatarSource {
  // Profile source.
  Profile = "profile",
  // Workspace source.
  Workspace = "workspace"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type AvatarIdentifier = string;
type AvatarDataURL = string;

type EventAvatarGeneric = { userId: string };

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Avatar {
  entries: AvatarEntries;
}

interface AvatarEntries {
  [userId: string]: AvatarEntry;
}

interface AvatarEntry {
  id?: AvatarIdentifier;
  url?: AvatarDataURL;
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const LOCAL_STATES = {
  refreshing: {} as { [userId: string]: boolean }
};

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $avatar = defineStore("avatar", {
  persist: false,

  state: (): Avatar => {
    return {
      entries: {}
    };
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    assert(userId: string): AvatarEntry {
      // Assign new avatar entry?
      if (!(userId in this.entries)) {
        this.$patch(state => {
          // Insert empty data
          state.entries[userId] = {};
        });
      }

      return this.entries[userId];
    },

    getAvatarDataUrl(userId: string): AvatarDataURL | void {
      // Notice: pseudo-getter, which needs to be defined as an action since \
      //   it might mutate the state (as we are asserting).
      return this.assert(userId).url;
    },

    async refresh(
      source: AvatarSource,
      userId: string,
      avatarLike: CoreProfileAvatar | CoreWorkspaceIcon
    ): Promise<void> {
      const entry = this.assert(userId);

      // Avatar changed, and not already refreshing?
      if (
        entry.id !== avatarLike.id &&
        LOCAL_STATES.refreshing[userId] !== true
      ) {
        // Mark as refreshing
        LOCAL_STATES.refreshing[userId] = true;

        // Immediately set avatar identifier
        this.$patch(() => {
          entry.id = avatarLike.id;
        });

        // Load avatar data (from source)
        // Notice: typically, avatars come from user profiles, although in \
        //   some less frequent cases we might want to load avatar-like \
        //   objects from other sources (eg. workspace icons, that behave \
        //   like avatars).
        let avatarData: string | void;

        switch (source) {
          case AvatarSource.Profile: {
            avatarData = await Broker.$profile.loadAvatarData(
              userId,
              avatarLike
            );

            break;
          }

          case AvatarSource.Workspace: {
            avatarData = await Broker.$account.loadWorkspaceIcon(avatarLike);

            break;
          }

          default: {
            throw new Error(`Avatar source unsupported: ${source}`);
          }
        }

        if (avatarData) {
          // Set avatar data URL
          const avatarDataUrl: string = avatarData;

          this.$patch(() => {
            entry.url = avatarDataUrl;
          });

          // Emit IPC changed event
          EventBus.emit("avatar:changed", {
            userId
          } as EventAvatarGeneric);
        } else {
          // Set avatar data
          this.$patch(() => {
            delete entry.url;
          });

          EventBus.emit("avatar:flushed", {
            userId
          } as EventAvatarGeneric);
        }

        // Remove refreshing marker
        delete LOCAL_STATES.refreshing[userId];
      }
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { AvatarSource };
export type { EventAvatarGeneric };
export default $avatar;
