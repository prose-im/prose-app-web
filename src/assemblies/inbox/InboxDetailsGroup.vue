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
  class="a-inbox-details-group"
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
      @close="onPopupSharedFilesClose"
    )

    leave-group(
      v-if="modals.leaveGroup.visible"
      @proceed="onModalLeaveGroupProceed"
      @close="onModalLeaveGroupClose"
      :loading="modals.leaveGroup.loading"
      type="group"
    )

    manage-group(
      v-if="popups.manageGroup.visible"
      @add="onPopupManageGroupAdd"
      @close="onPopupManageGroupClose"
      :room="room"
      type="group"
    )

    add-group-member(
      v-if="modals.addGroupMember.visible"
      @add="onModalAddGroupMemberAdd"
      @close="onModalAddGroupMemberClose"
      :loading="modals.addGroupMember.loading"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { Room } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
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
  name: "InboxDetailsGroup",

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

  data() {
    return {
      // --> STATE <--

      modals: {
        leaveGroup: {
          visible: false,
          loading: false
        },

        addGroupMember: {
          visible: false,
          loading: false
        }
      },

      popups: {
        sharedFiles: {
          visible: false
        },

        manageGroup: {
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
          title: "Manage group",
          click: this.onActionManageGroupClick,
          navigate: true
        },

        {
          id: "leave",
          title: "Leave this group",
          click: this.onActionLeaveGroupClick,
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
      this.modals.addGroupMember.visible = true;
    },

    onActionSharedFilesClick(): void {
      this.popups.sharedFiles.visible = true;
    },

    onActionManageGroupClick(): void {
      this.popups.manageGroup.visible = true;
    },

    onActionLeaveGroupClick(): void {
      this.modals.leaveGroup.visible = true;
    },

    onPopupSharedFilesClose(): void {
      this.popups.sharedFiles.visible = false;
    },

    onPopupManageGroupAdd(): void {
      this.onMembersAdd();
    },

    onPopupManageGroupClose(): void {
      this.popups.manageGroup.visible = false;
    },

    async onModalLeaveGroupProceed(): Promise<void> {
      try {
        if (!this.roomItem) {
          throw new Error("No room item");
        }

        const roomName = this.roomItem.name;

        // Remove item from sidebar (effectively leave the room)
        this.modals.leaveGroup.loading = true;

        await this.roomItem.removeFromSidebar();

        // Show left alert
        BaseAlert.info(
          `Left @${roomName}`,
          "You are no longer a part of group"
        );

        this.modals.leaveGroup.visible = false;
      } catch (error) {
        this.$log.error("Failed leaving group", error);

        // Show error alert
        BaseAlert.error("Cannot leave group", "Could you try again?");
      } finally {
        this.modals.leaveGroup.loading = false;
      }
    },

    onModalLeaveGroupClose(): void {
      this.modals.leaveGroup.visible = false;
    },

    onModalAddGroupMemberAdd(jidString: string): void {
      if (this.modals.addGroupMember.loading !== true) {
        this.modals.addGroupMember.loading = true;

        // TODO: remove this
        setTimeout(() => {
          this.modals.addGroupMember.visible = false;
          this.modals.addGroupMember.loading = false;

          BaseAlert.error(
            "Member not added",
            `${jidString} could not be added`
          );
        }, 1000);
      }
    },

    onModalAddGroupMemberClose(): void {
      this.modals.addGroupMember.visible = false;
    }
  }
};
</script>
