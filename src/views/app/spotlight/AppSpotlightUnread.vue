<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-view(
  :topbar-component="topbarComponent"
  :topbar-properties="topbarProperties"
  class="v-app-spotlight-unread"
)
  .v-app-spotlight-unread__content
    list-browse(
      :class=`[
        "v-app-spotlight-unread__content-inner",
        {
          "v-app-spotlight-unread__content-inner--empty": groups.length === 0
        }
      ]`
      :groups="groups"
      empty-illustration="inbox-empty"
      empty-title="Inbox Zero!"
      empty-description="There are no pending messages to process. Unread messages will appear here."
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";
import {
  JID,
  Room,
  RoomID,
  RoomType,
  SidebarItem
} from "@prose-im/prose-sdk-js";

// PROJECT: ASSEMBLIES
import {
  default as SpotlightTopbar,
  Actions as SpotlightTopbarActions
} from "@/assemblies/spotlight/SpotlightTopbar.vue";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { Groups as ListBrowseGroups } from "@/components/list/ListBrowse.vue";

// PROJECT: COMPOSABLES
import { useInterfaceTitle } from "@/composables/interface";

// PROJECT: STORES
import Store from "@/store";

// INTERFACES
interface UnreadMessageExcerpt {
  jid: JID;
  name: string;
  preview: string;
  timeAgo: string;
}

// CONSTANTS
const UNREAD_MESSAGES_DISPLAY_LAST_COUNT_MINIMUM = 3;
const UNREAD_MESSAGES_DISPLAY_LAST_COUNT_MAXIMUM = 10;

export default {
  name: "AppSpotlightUnread",

  setup() {
    useInterfaceTitle("Unread Stack");
  },

  data() {
    return {
      // --> DATA <--

      topbarComponent: shallowRef(SpotlightTopbar),

      topbarProperties: {
        actions: [
          [
            {
              icon: {
                name: "envelope.open",
                size: "20px"
              },

              tooltip: "Mark All as Read",
              disabled: true
            }
          ],

          [
            {
              icon: {
                name: "line.3.horizontal.decrease.circle",
                size: "18px"
              },

              tooltip: "More Actions",
              dropdown: [],
              disabled: true
            }
          ]
        ] as SpotlightTopbarActions
      },

      // --> STATE <--

      unreadMessageExcerpts: {} as {
        [roomId: RoomID]: Array<UnreadMessageExcerpt>;
      },

      pendingMarkReads: {} as { [roomId: RoomID]: boolean }
    };
  },

  computed: {
    groups(): ListBrowseGroups {
      const groups: ListBrowseGroups = [];

      this.items.forEach(item => {
        // Any unread messages for item?
        if (item.unreadCount > 0) {
          const entryLoading = this.pendingMarkReads[item.room.id] || false,
            entryMessageExcerpts = this.unreadMessageExcerpts[item.room.id];

          // Generate title aside value
          let entryTitleAside: string | undefined;

          if (entryMessageExcerpts?.length > 0) {
            entryTitleAside = `Last message ${
              entryMessageExcerpts[entryMessageExcerpts.length - 1].timeAgo
            }`;
          }

          groups.push({
            title: {
              name: item.room.name,
              icon: this.roomToIcon(item.room) || undefined,
              count: item.unreadCount,
              aside: entryTitleAside
            },

            results: [
              {
                loading: entryMessageExcerpts === undefined,

                entries: (entryMessageExcerpts || []).map(excerpt => {
                  return {
                    icon: {
                      component: BaseAvatar,

                      properties: {
                        jid: excerpt.jid,
                        size: "32px",
                        shadow: "none"
                      }
                    },

                    identity: {
                      primary: excerpt.name,
                      secondary: excerpt.timeAgo
                    },

                    preview: excerpt.preview
                  };
                }),

                actions: [
                  {
                    component: BaseButton,
                    label: "Reply",

                    properties: {
                      tint: "dark",
                      size: "medium",
                      disabled: entryLoading,
                      loading: entryLoading
                    },

                    listeners: {
                      click: async () => {
                        // Navigate to room in inbox
                        await this.$router.push({
                          name: "app.inbox",

                          params: {
                            roomId: item.room.id
                          }
                        });
                      }
                    }
                  },

                  {
                    component: BaseButton,
                    label: "Mark read",

                    properties: {
                      tint: "dark",
                      size: "medium",
                      reverse: true,
                      disabled: entryLoading,
                      loading: entryLoading
                    },

                    listeners: {
                      click: async () => {
                        await this.onUnreadActionMarkRead(item.room);
                      }
                    }
                  }
                ]
              }
            ]
          });
        }
      });

      return groups;
    },

    items(): Array<SidebarItem> {
      return Store.$room.getItems();
    }
  },

  mounted() {
    // Ensure that all unread room messages are loaded
    this.ensureUnreadRoomMessagesLoaded();
  },

  methods: {
    // --> EVENT LISTENERS <--

    async onUnreadActionMarkRead(room: Room): Promise<void> {
      if (this.pendingMarkReads[room.id] !== true) {
        this.pendingMarkReads[room.id] = true;

        try {
          // Mark all messages in room as read
          await room.markAsRead();

          // Show information alert
          BaseAlert.info(
            "Marked as read",
            `Messages with ${room.name} have been marked as read`
          );
        } catch (error) {
          this.$log.error("Could not mark room as read", error);

          // Show error alert
          BaseAlert.error(
            "Cannot mark as read",
            `Could not mark messages with ${room.name} as read`
          );
        } finally {
          delete this.pendingMarkReads[room.id];
        }
      }
    },

    // --> HELPERS <--

    async ensureUnreadRoomMessagesLoaded(): Promise<void> {
      await Promise.all(
        this.items
          .filter(item => {
            // Any unread messages for item? (load those messages)
            return item.unreadCount > 0;
          })
          .map(item => {
            // Load unread messages in room
            return this.loadUnreadRoomMessages(item.room, item.unreadCount);
          })
      );
    },

    async loadUnreadRoomMessages(room: Room, unreadCount = 0): Promise<void> {
      try {
        const result = await room.loadLatestMessages();

        // Only store the last Nth messages from the list of messages, and \
        //   only retain valuable information used for previewing unread \
        //   messages. Also, make sure to limit the maximum number of messages \
        //   that get shown to avoid cluttering the UI.
        this.unreadMessageExcerpts[room.id] = result.messages
          .slice(
            -Math.min(
              Math.max(unreadCount, UNREAD_MESSAGES_DISPLAY_LAST_COUNT_MINIMUM),
              UNREAD_MESSAGES_DISPLAY_LAST_COUNT_MAXIMUM
            )
          )
          .map(message => {
            return {
              jid: new JID(message.from),
              name: message.user.name,
              preview: message.content,
              timeAgo: this.$filters.date.timeAgo(message.date.getTime(), true)
            };
          });
      } catch (error) {
        this.$log.error(
          `Could not load unread message excerpts for room: ${room.id}`,
          error
        );

        // Important: fallback to empty list of message excerpts, so that it \
        //   is considered as loaded but empty for room.
        this.unreadMessageExcerpts[room.id] = [];
      }
    },

    roomToIcon(room: Room): string | void {
      switch (room.type) {
        case RoomType.DirectMessage: {
          return "message";
        }

        case RoomType.Group: {
          return "at";
        }

        case RoomType.PrivateChannel: {
          return "lock";
        }

        case RoomType.PublicChannel: {
          return "circle.grid.2x2";
        }

        default: {
          return undefined;
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
$c: ".v-app-spotlight-unread";

#{$c} {
  #{$c}__content {
    padding-block: $size-spotlight-browse-padding-block-start
      $size-spotlight-browse-padding-block-end;
    padding-inline: $size-layout-view-content-padding-sides;
    overflow-x: hidden;
    overflow-y: auto;
    flex: 1;

    #{$c}__content-inner {
      max-width: 860px;
      margin: 0 auto;

      &--empty {
        height: 100%;
        width: 100%;
        padding-block: 0;
      }
    }
  }
}
</style>
