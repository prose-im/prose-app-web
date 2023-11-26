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
  :class=`[
    "p-manage-group-members-table",
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
import { PropType } from "vue";
import { Room } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import {
  Column as DataTableColumn,
  Row as DataTableRow,
  Sizes as DataTableSizes,
  Control as DataTableControl,
  ControlType as DataTableControlType
} from "@/components/base/BaseDataTable.vue";

export default {
  name: "ManageGroupMembersTable",

  props: {
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
          }
        ] as Array<DataTableColumn>,

        rows: this.room.members.map(room => {
          return {
            selected: false,

            columns: {
              name: room.name,
              jid: room.jid.toString()
            }
          };
        }) as Array<DataTableRow>,

        sizes: { name: "40%", jid: "60%" } as DataTableSizes,

        controls: [
          {
            type: DataTableControlType.Add,
            tooltip: "Add members"
          },

          {
            type: DataTableControlType.Remove
          }
        ] as Array<DataTableControl>
      }
    };
  },

  methods: {
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
      }
    }
  }
};
</script>
