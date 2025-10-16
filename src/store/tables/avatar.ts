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

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum AvatarSource {
  // Profile source.
  Profile = "profile",
  // Workspace source.
  Workspace = "workspace"
}

enum AvatarOriginTrust {
  // Reference origin.
  Reference = "reference",
  // Best effort origin.
  BestEffort = "best-effort"
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
      avatarLike: CoreProfileAvatar | CoreWorkspaceIcon,
      originTrust = AvatarOriginTrust.Reference
    ): Promise<void> {
      const entry = this.assert(userId);

      // Guard against refreshing if avatar already exists in store, and trust \
      //   in origin is weak (best-effort loading)
      // Notice: this is useful to prevent 'christmas tree' loading and \
      //   unloading of avatar for user, if the avatar comes from a public \
      //   source such as public MUCs, and the user is also in our roster \
      //   (where we trust the avatar source as a reference).
      if (
        originTrust === AvatarOriginTrust.BestEffort &&
        entry.id !== undefined
      ) {
        // Abort immediately (do nothing).
        return;
      }

      // Avatar changed, and not already refreshing?
      if (
        entry.id !== avatarLike.id &&
        LOCAL_STATES.refreshing[userId] !== true
      ) {
        // Mark as refreshing
        LOCAL_STATES.refreshing[userId] = true;

        // Retain any previously-stored avatar URL
        // Notice: this URL will be de-allocated when we are done replacing \
        //   it with the newly-loaded avatar.
        const staleAvatarUrl: string | undefined = entry.url;

        // Immediately set avatar identifier
        this.$patch(() => {
          entry.id = avatarLike.id;
        });

        // Load avatar data (from source)
        // Notice: typically, avatars come from user profiles, although in \
        //   some less frequent cases we might want to load avatar-like \
        //   objects from other sources (eg. workspace icons, that behave \
        //   like avatars).
        let avatarBlob: Blob | void;

        switch (source) {
          case AvatarSource.Profile: {
            avatarBlob = await Broker.$profile.loadAvatarData(
              userId,
              avatarLike
            );

            break;
          }

          case AvatarSource.Workspace: {
            avatarBlob = await Broker.$account.loadWorkspaceIcon(avatarLike);

            break;
          }

          default: {
            throw new Error(`Avatar source unsupported: ${source}`);
          }
        }

        // Load avatar into store (as an URL)
        if (avatarBlob) {
          // Allocate avatar file as a local URL
          // Notice: instead of storing avatars as Base64 strings, create \
          //   re-usable URLs, which is the lightest way avatars can be \
          //   included across the application.
          const avatarLocalUrl = URL.createObjectURL(avatarBlob);

          logger.debug(
            `Allocated avatar URL for: ${userId} to: ${avatarLocalUrl} ` +
              `(${avatarBlob.size} bytes)`
          );

          this.$patch(() => {
            entry.url = avatarLocalUrl;
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

        // De-allocate previous avatar URL? (now stale)
        if (staleAvatarUrl !== undefined) {
          URL.revokeObjectURL(staleAvatarUrl);

          logger.info(
            `Revoked stale avatar URL for: ${userId} from: ${staleAvatarUrl}`
          );
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

export { AvatarSource, AvatarOriginTrust };
export type { EventAvatarGeneric };
export default $avatar;
