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
import { JID, Room, RoomID, SidebarItem } from "@prose-im/prose-sdk-js";

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
import { useEvents } from "@/composables/events";

// PROJECT: STORES
import Store from "@/store";
import { EventMessageGeneric } from "@/store/tables/inbox";

// INTERFACES
interface UnreadMessageExcerpt {
  id: string;
  jid: JID;
  name: string;
  preview: string;
  timeAgo: string;
}

// CONSTANTS
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

      // --> STATE <--

      unreadMessageExcerpts: {} as {
        [roomId: RoomID]: Array<UnreadMessageExcerpt>;
      },

      pendingLoadUnreadRoomMessages: {} as { [roomId: RoomID]: boolean },

      pendingMarkAllRead: false,
      pendingMarkReads: {} as { [roomId: RoomID]: boolean }
    };
  },

  computed: {
    topbarProperties(): { actions: SpotlightTopbarActions } {
      return {
        actions: [
          [
            {
              icon: {
                name: "envelope.open",
                size: "20px"
              },

              tooltip: "Mark All as Read",
              click: this.onTopbarActionMarkAllAsReadClick,

              disabled:
                this.pendingMarkAllRead === true || this.groups.length === 0
            }
          ]
        ]
      };
    },

    groups(): ListBrowseGroups {
      const groups: ListBrowseGroups = [];

      this.items.forEach(item => {
        // Any unread messages for item?
        if (item.unreadCount > 0) {
          const entryLoading = this.pendingMarkReads[item.room.id] || false,
            entryMessageExcerpts = this.unreadMessageExcerpts[item.room.id],
            entryMessageExcerptsLoading =
              this.pendingLoadUnreadRoomMessages[item.room.id] || false;

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
              count: item.unreadCount,
              aside: entryTitleAside,

              icon:
                this.$filters.string.roomTypeIntoIcon(item.room.type) ||
                undefined
            },

            results: [
              {
                loading:
                  entryMessageExcerptsLoading === true ||
                  entryMessageExcerpts === undefined,

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

  watch: {
    items: {
      immediate: true,

      handler(newValue: Array<SidebarItem>) {
        if (newValue) {
          // Ensure that all unread room messages are loaded
          this.ensureUnreadRoomMessagesLoaded(newValue);
        }
      }
    }
  },

  created() {
    // Bind inbox event handlers
    useEvents(Store.$inbox, {
      "message:inserted": this.onStoreMessageInserted
    });
  },

  methods: {
    // --> HELPERS <--

    async ensureUnreadRoomMessagesLoaded(
      items: Array<SidebarItem>
    ): Promise<void> {
      await Promise.all(
        items
          .filter(item => {
            // Any unread messages for item? (load those messages)
            // Notice: also make sure that room was not already loaded
            return (
              item.unreadCount > 0 &&
              !(item.room.id in this.unreadMessageExcerpts)
            );
          })
          .map(item => {
            // Load unread messages in room
            return this.loadUnreadRoomMessages(item.room, item.unreadCount);
          })
      );
    },

    async loadUnreadRoomMessages(room: Room, unreadCount = 0): Promise<void> {
      if (this.pendingLoadUnreadRoomMessages[room.id] !== true) {
        this.pendingLoadUnreadRoomMessages[room.id] = true;

        try {
          // Compute the number of messages to acquire and store
          const excerptsCount = Math.min(
            unreadCount,
            UNREAD_MESSAGES_DISPLAY_LAST_COUNT_MAXIMUM
          );

          // Load all unread messages
          const result = await room.loadUnreadMessages();

          // Append message excerpt from core message
          // Notice: only store the last Nth messages from the list of \
          //   messages, and only retain valuable information used for \
          //   previewing unread messages. Also, make sure to limit the \
          //   maximum number of messages that get shown to avoid cluttering \
          //   the UI.
          this.unreadMessageExcerpts[room.id] = result.messages
            .filter(message => {
              // Make sure messages all have identifiers
              return message.id ? true : false;
            })
            .slice(-excerptsCount)
            .map(message => {
              // Generate message excerpt data
              // Notice: message definitely has an identifier set there, since \
              //   we filtered out messages with empty identifiers earlier on.
              return this.makeUnreadMessageExcerpt({
                id: message.id || "",
                from: message.from,
                name: message.user.name,
                content: message.content,
                date: message.date
              });
            });
        } catch (error) {
          this.$log.error(
            `Could not load unread message excerpts for room: ${room.id}`,
            error
          );

          // Important: fallback to empty list of message excerpts, so that it \
          //   is considered as loaded but empty for room.
          this.unreadMessageExcerpts[room.id] = [];
        } finally {
          delete this.pendingLoadUnreadRoomMessages[room.id];
        }
      }
    },

    makeUnreadMessageExcerpt({
      id,
      from,
      name,
      content,
      date
    }: {
      id: string;
      from: string;
      name?: string;
      content: string;
      date: Date;
    }): UnreadMessageExcerpt {
      return {
        id: id,
        jid: new JID(from),
        name: name || from,
        preview: content,
        timeAgo: this.$filters.date.timeAgo(date.getTime(), true)
      };
    },

    // --> EVENT LISTENERS <--

    async onTopbarActionMarkAllAsReadClick(): Promise<void> {
      if (this.pendingMarkAllRead !== true) {
        this.pendingMarkAllRead = true;

        try {
          // Mark all messages as read in all rooms
          await Promise.all(
            this.items
              .filter(item => {
                // Any unread messages for item? (mark as read)
                return item.unreadCount > 0;
              })
              .map(item => {
                // Mark room as read (for item)
                return item.room.markAsRead();
              })
          );

          // Show information alert
          BaseAlert.info(
            "Marked all as read",
            "All messages have been marked as read"
          );
        } catch (error) {
          this.$log.error("Could not mark all rooms as read", error);

          // Show error alert
          BaseAlert.error(
            "Cannot mark all as read",
            "Could not mark all messages as read"
          );
        } finally {
          this.pendingMarkAllRead = false;
        }
      }
    },

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

    onStoreMessageInserted(event: EventMessageGeneric): void {
      // Room already loaded? Insert new message
      if (event.roomId in this.unreadMessageExcerpts) {
        const message = event.message,
          roomNames = Store.$inbox.getNames(event.roomId);

        // Append message excerpt from store message? (if we have sufficient \
        //   data, since this is a store message)
        if (
          message.id &&
          message.from &&
          message.content &&
          message.date &&
          roomNames[message.from]
        ) {
          const messageExcerpts = this.unreadMessageExcerpts[event.roomId];

          // Acquire possibly existing message
          const messageExcerpt = messageExcerpts.find(excerpt => {
            return excerpt.id === message.id;
          });

          // Append inserted message? (if does not already exists)
          if (messageExcerpt === undefined) {
            messageExcerpts.push(
              this.makeUnreadMessageExcerpt({
                id: message.id,
                from: message.from,
                name: roomNames[message.from]?.name,
                content: message.content,
                date: new Date(message.date)
              })
            );

            // Remove first message in list of excerpts? (limit reached)
            if (
              messageExcerpts.length >
              UNREAD_MESSAGES_DISPLAY_LAST_COUNT_MAXIMUM
            ) {
              messageExcerpts.shift();
            }
          }
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
