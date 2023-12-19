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
import { Room } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: COMPONENTS
import {
  Column as DataTableColumn,
  Control as DataTableControl,
  ControlType as DataTableControlType,
  Row as DataTableRow,
  Sizes as DataTableSizes
} from "@/components/base/BaseDataTable.vue";

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

        rows: this.room.participants.map(room => {
          return {
            selected: false,

            columns: {
              name: room.name,
              jid: room.jid.toString()
            }
          };
        }) as Array<DataTableRow>,

        sizes: { name: "40%", jid: "60%" } as DataTableSizes,

        controls: (this.type === "channel"
          ? [
              {
                type: DataTableControlType.Add,
                tooltip: "Add members"
              },

              {
                type: DataTableControlType.Remove
              }
            ]
          : []) as Array<DataTableControl>
      }
    };
  },

  computed: {
    isReadOnly(): boolean {
      return this.type !== "channel";
    }
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
