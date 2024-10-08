<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-data-table(
  @control="onDataTableControlClick"
  :columns="table.columns"
  :rows="table.rows"
  :sizes="table.sizes"
  :controls="table.controls"
  :read-only="isReadOnly"
  :class=`[
    "p-manage-multi-members-table",
    dataTableClass
  ]`
  sortable
  auto-height
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { Room, RoomAffiliation } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: COMPONENTS
import {
  Column as DataTableColumn,
  Control as DataTableControl,
  ControlType as DataTableControlType,
  Row as DataTableRow,
  Sizes as DataTableSizes
} from "@/components/base/BaseDataTable.vue";

// CONSTANTS
const AFFILIATION_ROLES = {
  [RoomAffiliation.Outcast]: "Banned",
  [RoomAffiliation.None]: "None",
  [RoomAffiliation.Member]: "Member",
  [RoomAffiliation.Admin]: "Admin",
  [RoomAffiliation.Owner]: "Owner"
};

export default {
  name: "ManageMultiMembersTable",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    dataTableClass: {
      type: String,
      required: true
    }
  },

  emits: ["add", "reinvite"],

  data() {
    return {
      // --> DATA <--

      table: {
        columns: [
          {
            id: "name",
            label: "Member Name"
          },

          {
            id: "jid",
            label: "Address"
          },

          {
            id: "role",
            label: "Role"
          }
        ] as Array<DataTableColumn>,

        rows: this.room.participants.map(participant => {
          return {
            selected: false,

            columns: {
              name: participant.name,

              jid:
                participant.jid !== undefined
                  ? participant.jid.toString()
                  : participant.id.toString(),

              role:
                AFFILIATION_ROLES[participant.affiliation] ||
                AFFILIATION_ROLES[RoomAffiliation.None]
            }
          };
        }) as Array<DataTableRow>,

        sizes: { name: "35%", jid: "50%", role: "15%" } as DataTableSizes,
        controls: this.generateTableControls()
      }
    };
  },

  computed: {
    isReadOnly(): boolean {
      return this.type !== "channel";
    }
  },

  methods: {
    // --> HELPERS <--

    generateTableControls(): Array<DataTableControl> {
      switch (this.type) {
        case "channel": {
          return [
            {
              type: DataTableControlType.Add,
              tooltip: "Add members"
            },

            {
              type: DataTableControlType.Remove
            }
          ];
        }

        case "group": {
          return [
            {
              type: DataTableControlType.Refresh,
              tooltip: "Resend all invites"
            }
          ];
        }

        default: {
          return [];
        }
      }
    },

    // --> EVENT LISTENERS <--

    onDataTableControlClick(control: DataTableControlType): void {
      switch (control) {
        case DataTableControlType.Add: {
          this.$emit("add");

          break;
        }

        case DataTableControlType.Remove: {
          // TODO: handle remove

          break;
        }

        case DataTableControlType.Refresh: {
          this.$emit("reinvite");

          break;
        }
      }
    }
  }
};
</script>
