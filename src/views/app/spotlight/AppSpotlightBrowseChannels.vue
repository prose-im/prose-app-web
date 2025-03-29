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
    "v-app-spotlight-browse-channels",
    {
      "v-app-spotlight-browse-channels--empty": (groups.length === 0 && !loading)
    }
  ]`
  :groups="groups"
  :loading="loading"
  empty-illustration="conversation-empty"
  empty-title="No public channels found."
  empty-description="Channels created by you or your team will appear here. You can join any of them!"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, RoomID, RoomType } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { Groups as ListBrowseGroups } from "@/components/list/ListBrowse.vue";

// PROJECT: COMPOSABLES
import { useInterfaceTitle } from "@/composables/interface";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: STORES
import Store from "@/store";
import { ChannelEntry, ChannelType } from "@/store/tables/channel";

export default {
  name: "AppSpotlightBrowseChannels",

  setup() {
    useInterfaceTitle("Channels");
  },

  data() {
    return {
      // --> STATE <--

      loading: false,

      pendingJoins: {} as { [roomId: RoomID]: boolean }
    };
  },

  computed: {
    channelListPublic(): ReturnType<typeof Store.$channel.getList> {
      return Store.$channel.getList().filter((entry: ChannelEntry) => {
        return entry.type === ChannelType.Public;
      });
    },

    groups(): ListBrowseGroups {
      if (this.channelListPublic.length > 0) {
        return [
          {
            title: {
              name: "Public channels",
              aside: `${this.channelListPublic.length} available`
            },

            results: this.channelListPublic.map((entry: ChannelEntry) => {
              const entryRoomId = entry.jid as RoomID,
                entryRoomJID = new JID(entry.jid),
                entryRoomMaybe = Store.$room.getRoom(entryRoomId),
                entryLoading = this.pendingJoins[entryRoomId] || false,
                isRoomJoined = entryRoomMaybe !== undefined;

              return {
                entries: [
                  {
                    icon: {
                      component: BaseIcon,

                      properties: {
                        name: this.$filters.string.roomTypeIntoIcon(
                          RoomType.PublicChannel
                        ),

                        size: "12px",
                        fill: "rgb(var(--color-accent-background-dark))"
                      }
                    },

                    identity: {
                      primary: entry.name
                    }
                  }
                ],

                actions: [
                  {
                    component: BaseButton,
                    label: isRoomJoined === false ? "Join Channel" : "Open",

                    properties: {
                      tint: "dark",
                      size: "medium",
                      reverse: isRoomJoined,
                      disabled: entryLoading,
                      loading: entryLoading
                    },

                    listeners: {
                      click: async () => {
                        if (isRoomJoined === true) {
                          await this.onBrowseActionNavigate(entryRoomId);
                        } else {
                          await this.onBrowseActionJoin(
                            entryRoomJID,
                            entryRoomId
                          );
                        }
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
        // Ensure that channel list is loaded
        // Notice: forcibly refresh from server.
        await Store.$channel.load(true);
      } catch (error) {
        this.$log.error("Could not load channel list", error);

        // Show error alert
        BaseAlert.error(
          "Error loading",
          "Channels could not be loaded. Try again?"
        );
      } finally {
        this.loading = false;
      }
    },

    // --> EVENT LISTENERS <--

    async onBrowseActionJoin(roomJID: JID, roomId: RoomID): Promise<void> {
      if (this.pendingJoins[roomId] !== true) {
        this.pendingJoins[roomId] = true;

        try {
          // Join channel
          await Broker.$room.join(roomJID);

          // Show success alert
          BaseAlert.success("Channel joined", "Public channel has been joined");
        } catch (error) {
          this.$log.error("Could not join public channel", error);

          // Show error alert
          BaseAlert.error(
            "Cannot join channel",
            "Could not join this public channel. Try this again?"
          );
        } finally {
          delete this.pendingJoins[roomId];
        }
      }
    },

    async onBrowseActionNavigate(roomId: RoomID): Promise<void> {
      // Navigate to channel
      // Notice: do not open conversation here, since this could perform \
      //   network checks, and we want navigation to be as fast as possible.
      this.$router.push({
        name: "app.inbox",

        params: {
          roomId
        }
      });
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-spotlight-browse-channels";

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
