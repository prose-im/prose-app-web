<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-browse(
  :class=`[
    "v-app-spotlight-browse-blocked",
    {
      "v-app-spotlight-browse-blocked--empty": (groups.length === 0 && !loading)
    }
  ]`
  :groups="groups"
  :loading="loading"
  empty-illustration="contact-empty"
  empty-title="You did not block anyone."
  empty-description="Blocked users will appear here, where you can unblock them."
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { Groups as ListBrowseGroups } from "@/components/list/ListBrowse.vue";

// PROJECT: STORES
import Store from "@/store";
import {
  RosterBlockListStatus,
  RosterBlockListEntry
} from "@/store/tables/roster";

// PROJECT: BROKER
import Broker from "@/broker";

export default {
  name: "AppSpotlightBrowseBlocked",

  data() {
    return {
      // --> STATE <--

      loading: false,

      pendingUnblocks: {} as { [jid: string]: boolean }
    };
  },

  computed: {
    blockListBlocked(): ReturnType<typeof Store.$roster.getBlockListList> {
      return Store.$roster
        .getBlockListList()
        .filter((entry: RosterBlockListEntry) => {
          return entry.status === RosterBlockListStatus.Blocked;
        });
    },

    groups(): ListBrowseGroups {
      if (this.blockListBlocked.length > 0) {
        return [
          {
            title: {
              name: "Blocked users",
              aside: `${this.blockListBlocked.length} blocked`
            },

            results: this.blockListBlocked.map(
              (entry: RosterBlockListEntry) => {
                const entryJID = new JID(entry.jid),
                  entryLoading = this.pendingUnblocks[entry.jid] || false;

                return {
                  icon: {
                    component: BaseAvatar,

                    properties: {
                      jid: entryJID,
                      size: "32px",
                      shadow: "none"
                    }
                  },

                  identity: {
                    primary: entry.name,
                    secondary: entry.jid
                  },

                  actions: [
                    {
                      component: BaseButton,
                      label: "Unblock",

                      properties: {
                        tint: "red",
                        size: "medium",
                        disabled: entryLoading,
                        loading: entryLoading
                      },

                      listeners: {
                        click: async () => {
                          await this.onBrowseActionUnblock(entryJID);
                        }
                      }
                    }
                  ]
                };
              }
            )
          }
        ];
      }

      return [];
    }
  },

  mounted() {
    // Ensure that data is loaded
    this.ensureLoaded();
  },

  methods: {
    // --> HELPERS <--

    async ensureLoaded(): Promise<void> {
      this.loading = true;

      try {
        // Ensure that block list is loaded
        // Notice: forcibly refresh from server.
        await Store.$roster.loadBlockList(true);
      } catch (error) {
        this.$log.error("Could not load block list", error);

        // Show error alert
        BaseAlert.error(
          "Error loading",
          "Blocked users could not be loaded. Try again?"
        );
      } finally {
        this.loading = false;
      }
    },

    // --> EVENT LISTENERS <--

    async onBrowseActionUnblock(jid: JID): Promise<void> {
      const jidString = jid.toString();

      if (this.pendingUnblocks[jidString] !== true) {
        this.pendingUnblocks[jidString] = true;

        try {
          // Unblock user
          await Broker.$roster.unblockUser(jid);

          // Show information alert
          BaseAlert.info(
            "User unblocked",
            "This user will be able to message you again"
          );
        } catch (error) {
          this.$log.error("Could not unblock user", error);

          // Show error alert
          BaseAlert.error(
            "Cannot unblock user",
            "Could not unblock this user. Try this again?"
          );
        } finally {
          delete this.pendingUnblocks[jidString];
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-spotlight-browse-blocked";

#{$c} {
  padding-block: $size-spotlight-browse-padding-block-start
    $size-spotlight-browse-padding-block-end;

  // --> BOOLEANS <--

  &--empty {
    height: 100%;
    padding-block: 0;
  }
}
</style>
