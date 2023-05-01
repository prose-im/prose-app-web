/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { jid, JID } from "@xmpp/jid";
import { defineStore } from "pinia";

// PROJECT: BROKER
import { PresenceType, PresenceShow } from "@/broker/stanzas/presence";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

interface PresenceEntryResources {
  [resource: string]: PresenceEntryResource;
}

type PresenceEntryResource = {
  resource: string;
  priority: number;
  type: PresenceType | null;
  show?: PresenceShow;
  status?: string;
  updatedAt?: number;
};

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface Presence {
  entries: PresenceEntries;
}

interface PresenceEntries {
  [jid: string]: PresenceEntry;
}

interface PresenceEntry {
  highest: PresenceEntryResource;
  resources: PresenceEntryResources;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const RESOURCE_DEFAULT = "";
const PRIORITY_DEFAULT = 0;
const TYPE_DEFAULT = PresenceType.Unavailable;

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $presence = defineStore("presence", {
  persist: true,

  state: (): Presence => {
    return {
      entries: {}
    };
  },

  getters: {
    getHighest: function () {
      return (bareJID: JID): PresenceEntryResource => {
        return this.assert(bareJID, true);
      };
    },

    getHighestOnlineJID: function () {
      return (bareJID: JID): JID => {
        const highest = this.getHighest(bareJID);

        // Highest JID is online? Return full JID.
        if (highest.type === null && highest.resource) {
          // Build JID in the form of: '[local]@[domain]/[resource]'
          return jid(bareJID.local, bareJID.domain, highest.resource);
        }

        // Return bare JID, as none is online (identity function)
        return bareJID;
      };
    }
  },

  actions: {
    assert(fullJID: JID, highest = false): PresenceEntryResource {
      const bareJIDString = fullJID.bare().toString(),
        fullJIDResource = fullJID.resource,
        entries = this.entries;

      // Assign new presence JID?
      if (!(bareJIDString in entries)) {
        this.$patch(() => {
          // Insert with defaults
          entries[bareJIDString] = {
            highest: {
              resource: RESOURCE_DEFAULT,
              priority: PRIORITY_DEFAULT,
              type: TYPE_DEFAULT
            },

            resources: {}
          };
        });
      }

      // Assign new presence resource for JID?
      if (!(fullJIDResource in entries[bareJIDString].resources)) {
        this.$patch(() => {
          // Insert with defaults
          entries[bareJIDString].resources[fullJIDResource] = {
            resource: fullJIDResource,
            priority: PRIORITY_DEFAULT,
            type: TYPE_DEFAULT
          };
        });
      }

      // Return highest resource, or target resource?
      if (highest === true) {
        return entries[bareJIDString].highest;
      }

      return entries[bareJIDString].resources[fullJIDResource];
    },

    unassert(fullJID: JID): number {
      const bareJIDString = fullJID.bare().toString(),
        fullJIDResource = fullJID.resource,
        entries = this.entries;

      // Obtain number of resources for JID
      let resourceCount =
        bareJIDString in entries
          ? Object.keys(entries[bareJIDString].resources).length
          : 0;

      // Unassign presence resource from JID?
      if (resourceCount > 0) {
        if (!fullJIDResource) {
          // No resource given, nuke all resources
          this.$patch(() => {
            // Nuke all resources
            entries[bareJIDString].resources = {};
          });

          // Set resource count to zero (as we nuked the whole JID)
          resourceCount = 0;
        } else if (fullJIDResource in entries[bareJIDString].resources) {
          // Unassign all JID resources? (as only current resource left)
          if (resourceCount === 1) {
            this.$patch(() => {
              // Nuke all resources
              entries[bareJIDString].resources = {};
            });
          } else {
            this.$patch(() => {
              // Nuke existing resource for JID
              delete entries[bareJIDString].resources[fullJIDResource];
            });
          }

          // Decrement resource count (as we just removed given resource)
          resourceCount -= 1;
        }
      }

      return resourceCount;
    },

    update(
      fullJID: JID,
      {
        priority,
        type,
        show,
        status
      }: {
        priority: number;
        type: PresenceType | null;
        show?: PresenceShow;
        status?: string;
      }
    ): void {
      switch (type) {
        case null: {
          // Available: update presence data for resource
          const entry = this.assert(fullJID);

          this.assignResource(entry, {
            priority,
            type,
            show,
            status,
            updatedAt: Date.now()
          });

          break;
        }

        case PresenceType.Unavailable: {
          // Unavailable: pull resource from store (if any)
          this.unassert(fullJID);

          break;
        }
      }

      // Recompute highest resource
      this.computeHighest(fullJID);
    },

    computeHighest(fullJID: JID): void {
      const bareJIDString = fullJID.bare().toString(),
        entries = this.entries;

      // Acquire presence with the highest-priority
      let highestPriorityResource: PresenceEntryResource | void = undefined;

      if (bareJIDString in entries) {
        const entry = entries[bareJIDString];

        // Find highest priority resource
        for (const resourceName in entry.resources) {
          const resource = entry.resources[resourceName];

          if (
            highestPriorityResource === undefined ||
            resource.priority >= highestPriorityResource.priority
          ) {
            highestPriorityResource = resource;
          }
        }

        // No presence for JID, or no highest priority resource found? (default \
        //   to offline)
        if (highestPriorityResource === undefined) {
          highestPriorityResource = {
            resource: RESOURCE_DEFAULT,
            priority: PRIORITY_DEFAULT,
            type: TYPE_DEFAULT
          };
        }

        // Update stored default resource
        this.assignResource(entry.highest, {
          resource: highestPriorityResource.resource,
          priority: highestPriorityResource.priority,
          type: highestPriorityResource.type,
          show: highestPriorityResource.show,
          status: highestPriorityResource.status
        });
      }
    },

    assignResource(
      entry: PresenceEntryResource,
      {
        priority,
        type,
        show,
        status,
        resource,
        updatedAt
      }: {
        priority: number;
        type: PresenceType | null;
        show?: PresenceShow;
        status?: string;
        resource?: string;
        updatedAt?: number;
      }
    ): void {
      this.$patch(() => {
        // Update required values
        entry.priority = priority;
        entry.type = type;
        entry.show = show;
        entry.status = status;

        // Update optional values?
        if (resource !== undefined) {
          entry.resource = resource;
        }
        if (updatedAt !== undefined) {
          entry.updatedAt = updatedAt;
        }
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $presence;
