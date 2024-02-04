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
      "v-app-spotlight-browse-blocked--empty": (groups.length === 0)
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

export default {
  name: "AppSpotlightBrowseBlocked",

  data() {
    return {
      // --> STATE <--

      loading: false
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
                return {
                  icon: {
                    component: BaseAvatar,

                    properties: {
                      jid: new JID(entry.jid),
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
                        reverse: true
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
        // Notice: this will not reload if already loaded.
        await Store.$roster.loadBlockList();
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
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-spotlight-browse-blocked";

.v-app-spotlight-browse-blocked {
  padding-block: $size-spotlight-browse-padding-block-start
    $size-spotlight-browse-padding-block-end;

  // --> BOOLEANS <--

  &--empty {
    height: 100%;
    padding-block: 0;
  }
}
</style>
