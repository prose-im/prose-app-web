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
    "v-app-spotlight-browse-invites",
    {
      "v-app-spotlight-browse-invites--empty": (groups.length === 0 && !loading)
    }
  ]`
  :groups="groups"
  :loading="loading"
  empty-illustration="inbox-empty"
  empty-title="No pending invites."
  empty-description="People can invite you to channels and groups. Contact requests from other workspaces will also appear here."
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

// PROJECT: COMPOSABLES
import { useInterfaceTitle } from "@/composables/interface";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: STORES
import Store from "@/store";
import { PresenceRequest } from "@/store/tables/presence";

// ENUMERATIONS
enum RespondDecision {
  // Respond decision.
  Accept = "accept",
  // Unregister decision.
  Decline = "decline"
}

export default {
  name: "AppSpotlightBrowseInvites",

  setup() {
    useInterfaceTitle("Invites");
  },

  data() {
    return {
      // --> STATE <--

      loading: false,

      pendingResponds: {} as { [requestId: string]: boolean }
    };
  },

  computed: {
    requestList(): ReturnType<typeof Store.$presence.getRequests> {
      return Store.$presence.getRequests();
    },

    groups(): ListBrowseGroups {
      if (this.requestList.length > 0) {
        return [
          {
            title: {
              name: "Contact requests",
              aside: `${this.requestList.length} pending`
            },

            results: this.requestList.map((request: PresenceRequest) => {
              const requestRequestId = request.id.toString(),
                requestLoading =
                  this.pendingResponds[requestRequestId] || false;

              return {
                entries: [
                  {
                    icon: {
                      component: BaseAvatar,

                      properties: {
                        jid: new JID(request.jid),
                        size: "32px",
                        shadow: "none"
                      }
                    },

                    identity: {
                      primary: request.name,
                      secondary: request.jid
                    },

                    preview:
                      "Would like to connect with you, and add each other to their contacts."
                  }
                ],

                actions: [
                  {
                    component: BaseButton,
                    label: "Accept",

                    properties: {
                      tint: "dark",
                      size: "medium",
                      disabled: requestLoading,
                      loading: requestLoading
                    },

                    listeners: {
                      click: async () => {
                        await this.onBrowseActionRespond(
                          RespondDecision.Accept,
                          request,
                          requestRequestId
                        );
                      }
                    }
                  },

                  {
                    component: BaseButton,
                    label: "Decline",

                    properties: {
                      tint: "red",
                      size: "medium",
                      reverse: true,
                      disabled: requestLoading,
                      loading: requestLoading
                    },

                    listeners: {
                      click: async () => {
                        await this.onBrowseActionRespond(
                          RespondDecision.Decline,
                          request,
                          requestRequestId
                        );
                      }
                    }
                  }
                ]
              };
            })
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
        // Ensure that invite requests are loaded
        // Notice: forcibly refresh.
        await Store.$presence.loadRequests(true);
      } catch (error) {
        this.$log.error("Could not load invites", error);

        // Show error alert
        BaseAlert.error(
          "Error loading",
          "Invites could not be loaded. Try again?"
        );
      } finally {
        this.loading = false;
      }
    },

    // --> EVENT LISTENERS <--

    async onBrowseActionRespond(
      decision: RespondDecision,
      request: PresenceRequest,
      requestId: string
    ): Promise<void> {
      if (this.pendingResponds[requestId] !== true) {
        this.pendingResponds[requestId] = true;

        try {
          switch (decision) {
            case RespondDecision.Accept: {
              // Accept invite
              await Broker.$presence.approvePresenceSubscriptionRequest(
                request.id
              );

              // Show success alert
              BaseAlert.success(
                "Request accepted",
                "This contact has been added"
              );

              break;
            }

            case RespondDecision.Decline: {
              // Decline invite
              await Broker.$presence.denyPresenceSubscriptionRequest(
                request.id
              );

              // Show information alert
              BaseAlert.info(
                "Request declined",
                "This contact has not been added"
              );

              break;
            }
          }
        } catch (error) {
          this.$log.error("Could not respond to invite", error);

          // Show error alert
          BaseAlert.error(
            "Cannot respond",
            "Could not respond to this invite. Try this again?"
          );
        } finally {
          delete this.pendingResponds[requestId];
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
$c: ".v-app-spotlight-browse-invites";

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
