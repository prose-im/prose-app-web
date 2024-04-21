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
    "v-app-spotlight-browse-people",
    {
      "v-app-spotlight-browse-people--empty": (groups.length === 0 && !loading)
    }
  ]`
  :groups="groups"
  :loading="loading"
  empty-illustration="contact-not-found"
  empty-title="No people in your team."
  empty-description="There is no one in your workspace at the moment. This is your team's public directory."
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, Group as RosterGroup } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { Groups as ListBrowseGroups } from "@/components/list/ListBrowse.vue";

// PROJECT: COMPOSABLES
import { useInterfaceTitle } from "@/composables/interface";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: STORES
import Store from "@/store";
import { RosterContactsEntry, RosterContactsList } from "@/store/tables/roster";

// CONSTANTS
const ROSTER_GROUP_ORDER = [RosterGroup.Team, RosterGroup.Other];

const ROSTER_GROUP_TITLES = {
  [RosterGroup.Team]: "People in my team",
  [RosterGroup.Other]: "External contacts (outside of my team)"
};

export default {
  name: "AppSpotlightBrowsePeople",

  setup() {
    useInterfaceTitle("People");
  },

  data() {
    return {
      // --> STATE <--

      loading: false,

      pendingMessages: {} as { [jid: string]: boolean },
      pendingRemoves: {} as { [jid: string]: boolean }
    };
  },

  computed: {
    rosterContactList(): ReturnType<typeof Store.$roster.getContactsList> {
      return Store.$roster.getContactsList();
    },

    rosterContactGroups(): ReturnType<typeof Store.$roster.getContactsGroups> {
      return Store.$roster.getContactsGroups();
    },

    groups(): ListBrowseGroups {
      const groups: ListBrowseGroups = [];

      if (this.rosterContactList.length > 0) {
        ROSTER_GROUP_ORDER.forEach((rosterGroup: RosterGroup) => {
          const rosterGroupEntries: RosterContactsList | void =
            this.rosterContactGroups[rosterGroup];

          if (rosterGroupEntries !== undefined) {
            groups.push({
              title: {
                name: ROSTER_GROUP_TITLES[rosterGroup],

                aside:
                  rosterGroupEntries.length === 1
                    ? "1 contact"
                    : `${rosterGroupEntries.length} contacts`
              },

              results: rosterGroupEntries.map((entry: RosterContactsEntry) => {
                const entryJID = new JID(entry.jid),
                  entryLoading =
                    this.pendingMessages[entry.jid] ||
                    this.pendingRemoves[entry.jid] ||
                    false;

                // Generate entry actions
                const entryActions = [
                  {
                    component: BaseButton,
                    label: "Message",

                    properties: {
                      tint: "dark",
                      size: "medium",
                      reverse: false,
                      disabled: entryLoading,
                      loading: entryLoading
                    },

                    listeners: {
                      click: async () => {
                        await this.onBrowseActionMessage(entryJID);
                      }
                    }
                  }
                ];

                if (rosterGroup === RosterGroup.Other) {
                  entryActions.push({
                    component: BaseButton,
                    label: "Remove",

                    properties: {
                      tint: "red",
                      size: "medium",
                      reverse: true,
                      disabled: entryLoading,
                      loading: entryLoading
                    },

                    listeners: {
                      click: async () => {
                        await this.onBrowseActionRemove(entryJID);
                      }
                    }
                  });
                }

                return {
                  entries: [
                    {
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

                      preview:
                        rosterGroup === RosterGroup.Other
                          ? "This contact is outside of your team. " +
                            "Make sure you trust them."
                          : undefined
                    }
                  ],

                  actions: entryActions
                };
              })
            });
          }
        });
      }

      return groups;
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
        // Ensure that roster contacts are loaded
        // Notice: forcibly refresh from server.
        await Store.$roster.loadContacts(true);
      } catch (error) {
        this.$log.error("Could not load contact list", error);

        // Show error alert
        BaseAlert.error(
          "Error loading",
          "Contacts could not be loaded. Try again?"
        );
      } finally {
        this.loading = false;
      }
    },

    // --> EVENT LISTENERS <--

    async onBrowseActionMessage(jid: JID): Promise<void> {
      const jidString = jid.toString();

      if (this.pendingMessages[jidString] !== true) {
        this.pendingMessages[jidString] = true;

        try {
          // Start conversation
          const roomJID = await Broker.$room.startConversation([jid]);

          // Navigate to conversation?
          if (roomJID !== undefined) {
            this.$router.push({
              name: "app.inbox",

              params: {
                roomId: roomJID.toString()
              }
            });
          }
        } catch (error) {
          this.$log.error("Could not start conversation", error);

          // Show error alert
          BaseAlert.error(
            "Cannot start conversation",
            "Could not start this conversation. Try this again?"
          );
        } finally {
          delete this.pendingMessages[jidString];
        }
      }
    },

    async onBrowseActionRemove(jid: JID): Promise<void> {
      const jidString = jid.toString();

      if (this.pendingRemoves[jidString] !== true) {
        this.pendingRemoves[jidString] = true;

        try {
          // Remove contact
          await Broker.$roster.removeContact(jid);

          // Show information alert
          BaseAlert.info("Contact removed", "This contact has been removed");
        } catch (error) {
          this.$log.error("Could not remove contact", error);

          // Show error alert
          BaseAlert.error(
            "Cannot remove contact",
            "This contact could not be removed. Try again?"
          );
        } finally {
          delete this.pendingRemoves[jidString];
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
$c: ".v-app-spotlight-browse-people";

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
