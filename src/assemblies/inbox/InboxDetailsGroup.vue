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
      type="group"
    )

    manage-group(
      v-if="popups.manageGroup.visible"
      @close="onPopupManageGroupClose"
      type="group"
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
import InboxDetailsGroupIdentity from "@/components/inbox/InboxDetailsGroupIdentity.vue";
import InboxDetailsGroupInformation from "@/components/inbox/InboxDetailsGroupInformation.vue";
import InboxDetailsGroupMembers from "@/components/inbox/InboxDetailsGroupMembers.vue";
import {
  default as InboxDetailsGenericActions,
  Action as DetailsAction
} from "@/components/inbox/InboxDetailsGenericActions.vue";

// PROJECT: MODALS
import LeaveGroup from "@/modals/inbox/LeaveGroup.vue";

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
    LeaveGroup,
    SharedFiles,
    ManageGroup
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
          visible: false
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
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

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

    onPopupManageGroupClose(): void {
      this.popups.manageGroup.visible = false;
    },

    onModalLeaveGroupProceed(): void {
      // TODO: proceed

      this.modals.leaveGroup.visible = false;
    },

    onModalLeaveGroupClose(): void {
      this.modals.leaveGroup.visible = false;
    }
  }
};
</script>
