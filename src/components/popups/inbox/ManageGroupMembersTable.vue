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
    dataTableClass: {
      type: String,
      required: true
    }
  },

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

        rows: [
          // TODO: from dynamic data (those are fixtures)

          {
            selected: false,

            columns: {
              name: "Member #1",
              jid: "(no address)"
            }
          },

          {
            selected: false,

            columns: {
              name: "Member #2",
              jid: "(no address)"
            }
          },

          {
            selected: false,

            columns: {
              name: "Member #3",
              jid: "(no address)"
            }
          },

          {
            selected: false,

            columns: {
              name: "Member #4",
              jid: "(no address)"
            }
          }
        ] as Array<DataTableRow>,

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

    onDataTableControlClick(): void {
      // TODO: handle action for type
    }
  }
};
</script>
