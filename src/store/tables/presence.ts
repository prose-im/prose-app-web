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
 * INTERFACES
 * ************************************************************************* */

interface Presence {
  [jid: string]: PresenceResources;
}

interface PresenceResources {
  [resource: string]: PresenceResource;
}

interface PresenceResource {
  priority: number;
  type: PresenceType | null;
  show?: PresenceShow;
  status?: string;
  updatedAt?: number;
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
    getResource: function () {
      return (fullJID: JID): PresenceResource => {
        return this.assert(fullJID);
      };
    },

    getHighest: function () {
      return (bareJID: JID): PresenceResource | void => {
        const bareJIDString = bareJID.bare().toString();

        // Acquire presence with the highest-priority
        if (bareJIDString in this) {
          const resources = this[bareJIDString];

          // Find highest priority resource
          let highestPriorityResource: PresenceResource | void = undefined;

          for (const resourceName in resources) {
            const resource = resources[resourceName];

            if (
              highestPriorityResource === undefined ||
              resource.priority >= highestPriorityResource.priority
            ) {
              highestPriorityResource = resource;
            }
          }

          // Return found highest priority resource?
          if (highestPriorityResource !== undefined) {
            return highestPriorityResource;
          }
        }

        // No presence for JID, or no highest priority resource found (return \
        //   default offline)
        return {
          priority: 0,
          type: PresenceType.Unavailable
        };
      };
    }
  },

  actions: {
    assert(fullJID: JID): PresenceResource {
      const bareJIDString = fullJID.bare().toString(),
        fullJIDResource = fullJID.resource;

      // Assign new presence JID?
      if (!(bareJIDString in this)) {
        this.$patch(() => {
          // Insert with defaults
          this[bareJIDString] = {};
        });
      }

      // Assign new presence resource for JID?
      if (!(fullJIDResource in this[bareJIDString])) {
        this.$patch(() => {
          // Insert with defaults
          this[bareJIDString][fullJIDResource] = {
            priority: 0,
            type: null
          };
        });
      }

      return this[bareJIDString][fullJIDResource];
    },

    unassert(fullJID: JID): number {
      const bareJIDString = fullJID.bare().toString(),
        fullJIDResource = fullJID.resource;

      // Obtain number of resources for JID
      let resourceCount =
        bareJIDString in this ? Object.keys(this[bareJIDString]).length : 0;

      // Unassign presence resource from JID?
      if (resourceCount > 0) {
        if (!fullJIDResource) {
          // No resource given, nuke whole JID
          this.$patch(() => {
            // Nuke whole JID
            delete this[bareJIDString];
          });

          // Set resource count to zero (as we nuked the whole JID)
          resourceCount = 0;
        } else if (fullJIDResource in this[bareJIDString]) {
          // Unassign JID whole presence? (as only current resource left)
          if (resourceCount === 1) {
            this.$patch(() => {
              // Nuke whole JID
              delete this[bareJIDString];
            });
          } else {
            this.$patch(() => {
              // Nuke existing resource for JID
              delete this[bareJIDString][fullJIDResource];
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

          this.$patch(() => {
            resource.priority = priority;
            resource.type = type;
            resource.show = show;
            resource.status = status;
            resource.updatedAt = Date.now();
          });

          break;
        }

        case PresenceType.Unavailable: {
          // Unavailable: pull resource from store (if any)
          this.unassert(fullJID);

          break;
        }
      }
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default $presence;
