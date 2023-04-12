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
import { PresenceType, PresenceShow } from "@/broker/stanzas/presence";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

interface PresenceEntryResources {
  [resource: string]: PresenceEntryResource;
}

type PresenceEntryResource = {
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
  [jid: string]: PresenceEntry;
}

interface PresenceEntry {
  highest: PresenceEntryResource;
  resources: PresenceEntryResources;
}

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $presence = defineStore("presence", {
  persist: true,

  state: (): Presence => {
    return {};
  },

  getters: {
    getHighest: function () {
      return (bareJID: JID): PresenceEntryResource => {
        return this.assert(bareJID, true);
      };
    }
  },

  actions: {
    assert(fullJID: JID, highest = false): PresenceEntryResource {
      const bareJIDString = fullJID.bare().toString(),
        fullJIDResource = fullJID.resource;

      // Assign new presence JID?
      if (!(bareJIDString in this)) {
        this.$patch(() => {
          // Insert with defaults
          this[bareJIDString] = {
            highest: {
              // TODO: commonize defaults
              priority: 0,
              type: PresenceType.Unavailable
            },

            resources: {}
          };
        });
      }

      // Assign new presence resource for JID?
      if (!(fullJIDResource in this[bareJIDString].resources)) {
        this.$patch(() => {
          // Insert with defaults
          this[bareJIDString].resources[fullJIDResource] = {
            priority: 0,
            type: null
          };
        });
      }

      // Return highest resource, or target resource?
      if (highest === true) {
        return this[bareJIDString].highest;
      }

      return this[bareJIDString].resources[fullJIDResource];
    },

    unassert(fullJID: JID): number {
      const bareJIDString = fullJID.bare().toString(),
        fullJIDResource = fullJID.resource;

      // Obtain number of resources for JID
      let resourceCount =
        bareJIDString in this
          ? Object.keys(this[bareJIDString].resources).length
          : 0;

      // Unassign presence resource from JID?
      if (resourceCount > 0) {
        if (!fullJIDResource) {
          // No resource given, nuke all resources
          this.$patch(() => {
            // Nuke all resources
            // TODO
          });

          // Set resource count to zero (as we nuked the whole JID)
          resourceCount = 0;
        } else if (fullJIDResource in this[bareJIDString].resources) {
          // Unassign all JID resources? (as only current resource left)
          if (resourceCount === 1) {
            this.$patch(() => {
              // Nuke all resources
              // TODO
            });
          } else {
            this.$patch(() => {
              // Nuke existing resource for JID
              delete this[bareJIDString].resources[fullJIDResource];
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
          const resource = this.assert(fullJID);

          this.assignResource(resource, {
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
      const bareJIDString = fullJID.bare().toString();

      // Acquire presence with the highest-priority
      let highestPriorityResource: PresenceEntryResource | void = undefined;

      if (bareJIDString in this) {
        const entry = this[bareJIDString];

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
            // TODO: commonize defaults
            priority: 0,
            type: PresenceType.Unavailable
          };
        }

        // Update stored default resource
        this.assignResource(entry.highest, {
          priority: highestPriorityResource.priority,
          type: highestPriorityResource.type,
          show: highestPriorityResource.show,
          status: highestPriorityResource.status
        });
      }
    },

    assignResource(
      resource: PresenceEntryResource,
      {
        priority,
        type,
        show,
        status,
        updatedAt
      }: {
        priority: number;
        type: PresenceType | null;
        show?: PresenceShow;
        status?: string;
        updatedAt?: number;
      }
    ): void {
      this.$patch(() => {
        resource.priority = priority;
        resource.type = type;
        resource.show = show;
        resource.status = status;

        if (updatedAt !== undefined) {
          resource.updatedAt = updatedAt;
        }
      });
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $presence;
