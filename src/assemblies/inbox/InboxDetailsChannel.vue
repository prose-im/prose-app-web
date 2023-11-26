<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-sidebar-details(
  class="a-inbox-details-channel"
)
  template(
    v-slot:header
  )
    inbox-details-group-identity(
      :room="room"
    )

  template(
    v-slot:items
  )
    inbox-details-group-information(
      :room="room"
      :header-class="headerClass"
      :item-class="itemClass"
      :expanded="layout.inbox.details.sections.information"
    )

    inbox-details-group-members(
      @add="onMembersAdd"
      :room="room"
      :header-class="headerClass"
      :item-class="itemClass"
      :expanded="layout.inbox.details.sections.members"
      type="channel"
    )

    inbox-details-generic-actions(
      :room="room"
      :actions="actions"
      :header-class="headerClass"
      :item-class="itemClass"
      :expanded="layout.inbox.details.sections.actions"
    )

  template(
    v-slot:default
  )
    shared-files(
      v-if="popups.sharedFiles.visible"
      @file-preview="onPopupSharedFilesFilePreview"
      @close="onPopupSharedFilesClose"
    )

    manage-group(
      v-if="popups.manageChannel.visible"
      @add="onPopupManageChannelAdd"
      @close="onPopupManageChannelClose"
      :room="room"
      type="channel"
    )

    leave-group(
      v-if="modals.leaveChannel.visible"
      @proceed="onModalLeaveChannelProceed"
      @close="onModalLeaveChannelClose"
      :loading="modals.leaveChannel.loading"
      type="channel"
    )

    add-group-member(
      v-if="modals.addChannelMember.visible"
      @add="onModalAddChannelMemberAdd"
      @close="onModalAddChannelMemberClose"
      :loading="modals.addChannelMember.loading"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { Room, RoomChannel } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Collection as FilePreviewCollection } from "@/components/inbox/InboxFilePreview.vue";
import InboxDetailsGroupIdentity from "@/components/inbox/InboxDetailsGroupIdentity.vue";
import InboxDetailsGroupInformation from "@/components/inbox/InboxDetailsGroupInformation.vue";
import InboxDetailsGroupMembers from "@/components/inbox/InboxDetailsGroupMembers.vue";
import {
  default as InboxDetailsGenericActions,
  Action as DetailsAction
} from "@/components/inbox/InboxDetailsGenericActions.vue";

// PROJECT: MODALS
import LeaveGroup from "@/modals/inbox/LeaveGroup.vue";
import AddGroupMember from "@/modals/inbox/AddGroupMember.vue";

// PROJECT: POPUPS
import SharedFiles from "@/popups/inbox/SharedFiles.vue";
import ManageGroup from "@/popups/inbox/ManageGroup.vue";

export default {
  name: "InboxDetailsChannel",

  components: {
    InboxDetailsGroupIdentity,
    InboxDetailsGroupInformation,
    InboxDetailsGroupMembers,
    InboxDetailsGenericActions,
    SharedFiles,
    ManageGroup,
    LeaveGroup,
    AddGroupMember
  },

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    headerClass: {
      type: String,
      default: null
    },

    itemClass: {
      type: String,
      default: null
    }
  },

  emits: ["filePreview"],

  data() {
    return {
      // --> STATE <--

      modals: {
        leaveChannel: {
          visible: false,
          loading: false
        },

        addChannelMember: {
          visible: false,
          loading: false
        }
      },

      popups: {
        sharedFiles: {
          visible: false
        },

        manageChannel: {
          visible: false
        }
      }
    };
  },

  computed: {
    actions(): Array<DetailsAction> {
      return [
        {
          id: "files",
          title: "View shared files",
          click: this.onActionSharedFilesClick,
          navigate: true
        },

        {
          id: "manage",
          title: "Manage channel",
          click: this.onActionManageChannelClick,
          navigate: true
        },

        {
          id: "leave",
          title: "Leave this channel",
          click: this.onActionLeaveChannelClick,
          color: "red"
        }
      ];
    },

    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    roomItem(): ReturnType<typeof Store.$room.getRoomItem> {
      return this.room ? Store.$room.getRoomItem(this.room.id) : undefined;
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onMembersAdd(): void {
      this.modals.addChannelMember.visible = true;
    },

    onActionSharedFilesClick(): void {
      this.popups.sharedFiles.visible = true;
    },

    onActionManageChannelClick(): void {
      this.popups.manageChannel.visible = true;
    },

    onActionLeaveChannelClick(): void {
      this.modals.leaveChannel.visible = true;
    },

    onPopupSharedFilesFilePreview(
      collection: FilePreviewCollection,
      index = 0
    ): void {
      this.$emit("filePreview", collection, index);
    },

    onPopupSharedFilesClose(): void {
      this.popups.sharedFiles.visible = false;
    },

    onPopupManageChannelAdd(): void {
      this.onMembersAdd();
    },

    onPopupManageChannelClose(): void {
      this.popups.manageChannel.visible = false;
    },

    async onModalLeaveChannelProceed(): Promise<void> {
      try {
        if (!this.roomItem) {
          throw new Error("No room item");
        }

        const roomName = this.roomItem.name;

        // Remove item from sidebar (effectively leave the room)
        this.modals.leaveChannel.loading = true;

        await this.roomItem.removeFromSidebar();

        // Show left alert
        BaseAlert.info(
          `Left #${roomName}`,
          "You are no longer a member of channel"
        );

        this.modals.leaveChannel.visible = false;
      } catch (error) {
        this.$log.error("Failed leaving channel", error);

        // Show error alert
        BaseAlert.error("Cannot leave channel", "Could you try again?");
      } finally {
        this.modals.leaveChannel.loading = false;
      }
    },

    onModalLeaveChannelClose(): void {
      this.modals.leaveChannel.visible = false;
    },

    async onModalAddChannelMemberAdd(jidString: string): Promise<void> {
      if (this.modals.addChannelMember.loading !== true) {
        try {
          this.modals.addChannelMember.loading = true;

          // Invite user to channel
          await (this.room as RoomChannel).inviteUsers([jidString]);

          // Show success alert
          BaseAlert.success("Member added", `${jidString} has been added`);

          this.modals.addChannelMember.visible = false;
        } catch (error) {
          this.$log.error("Failed adding member", error);

          // Show error alert
          BaseAlert.error(
            "Member not added",
            `${jidString} could not be added`
          );
        } finally {
          this.modals.addChannelMember.loading = false;
        }
      }
    },

    onModalAddChannelMemberClose(): void {
      this.modals.addChannelMember.visible = false;
    }
  }
};
</script>
