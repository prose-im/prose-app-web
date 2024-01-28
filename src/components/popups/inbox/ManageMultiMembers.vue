<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
form-settings-editor(
  :fieldsets="fieldsets"
  class="p-manage-multi-members"
  fieldset-class="p-manage-multi-members__fieldset"
  title-class="p-manage-multi-members__title"
  part-class="p-manage-multi-members__part"
)
  template(
    v-slot:modals
  )
    reinvite-multi-members(
      v-if="modals.reinviteMultiMembers.visible"
      @proceed="onModalReinviteMultiMembersProceed"
      @close="onModalReinviteMultiMembersClose"
      :type="type"
      :loading="modals.reinviteMultiMembers.loading"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef, PropType } from "vue";
import upperFirst from "lodash.upperfirst";
import { Room, RoomType, RoomGroup } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset
} from "@/components/form/FormSettingsEditor.vue";
import ManageMultiMembersTable from "@/components/popups/inbox/ManageMultiMembersTable.vue";

// PROJECT: MODALS
import ReinviteMultiMembers from "@/modals/inbox/ReinviteMultiMembers.vue";

export default {
  name: "ManageMultiMembers",

  components: {
    FormSettingsEditor,
    ManageMultiMembersTable,
    ReinviteMultiMembers
  },

  props: {
    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    room: {
      type: Object as PropType<Room>,
      required: true
    },

    dataTableClass: {
      type: String,
      required: true
    }
  },

  emits: ["add"],

  data() {
    return {
      // --> STATE <--

      modals: {
        reinviteMultiMembers: {
          visible: false,
          loading: false
        }
      },

      // --> DATA <--

      fieldsets: [
        {
          id: "members",
          title: `${upperFirst(this.type)} members`,

          parts: [
            {
              id: "table",
              component: shallowRef(ManageMultiMembersTable),

              properties: {
                room: this.room,
                type: this.type,
                dataTableClass: this.dataTableClass
              },

              listeners: {
                add: this.onMembersTableAdd,
                reinvite: this.onMembersTableReinvite
              }
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onMembersTableAdd(): void {
      this.$emit("add");
    },

    onMembersTableReinvite(): void {
      this.modals.reinviteMultiMembers.visible = true;
    },

    async onModalReinviteMultiMembersProceed(): Promise<void> {
      try {
        this.modals.reinviteMultiMembers.loading = true;

        // Assert that room is group
        if (this.room.type !== RoomType.Group) {
          throw new Error("Room is not group");
        }

        // Re-invite everyone
        await (this.room as RoomGroup).resendInvitesToMembers();

        // Show success alert
        BaseAlert.success(
          "Re-invited everyone",
          `All ${this.type} members have been re-invited`
        );

        this.modals.reinviteMultiMembers.visible = false;
      } catch (error) {
        this.$log.error(`Failed re-inviting ${this.type} members`, error);

        // Show error alert
        BaseAlert.error(
          "Cannot re-invite",
          `Error re-inviting ${this.type} members`
        );
      } finally {
        this.modals.reinviteMultiMembers.loading = false;
      }
    },

    onModalReinviteMultiMembersClose(): void {
      this.modals.reinviteMultiMembers.visible = false;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-manage-multi-members";

.p-manage-multi-members {
  &,
  #{$c}__fieldset {
    display: flex;
    flex-direction: column;
  }

  #{$c}__fieldset {
    flex: 1;

    #{$c}__title {
      flex: 0 0 auto;
    }

    #{$c}__part {
      flex: 1;
    }
  }
}
</style>
