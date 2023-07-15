<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-edit-profile-encryption-device-other
  base-data-table(
    @control="onDataTableControlClick"
    :columns="table.columns"
    :rows="table.rows"
    :sizes="table.sizes"
    :controls="table.controls"
    :class="dataTableClass"
    sortable
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
  name: "EditProfileEncryptionDeviceOther",

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
            label: "Device Name"
          },

          {
            id: "device",
            label: "Device ID"
          },

          {
            id: "hash",
            label: "Security Hash"
          }
        ] as Array<DataTableColumn>,

        rows: [
          // TODO: from dynamic data (those are fixtures)

          {
            selected: false,

            columns: {
              name: "Unknown Device #1",
              device: "(none)",
              hash: "(none)"
            }
          },

          {
            selected: false,

            columns: {
              name: "Unknown Device #2",
              device: "(none)",
              hash: "(none)"
            }
          },

          {
            selected: false,

            columns: {
              name: "Unknown Device #3",
              device: "(none)",
              hash: "(none)"
            }
          }
        ] as Array<DataTableRow>,

        sizes: { name: "40%", device: "25%", hash: "35%" } as DataTableSizes,

        controls: [
          {
            type: DataTableControlType.Remove
          }
        ] as Array<DataTableControl>
      }
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onDataTableControlClick(type: DataTableControlType): void {
      // TODO: handle action for type
    }
  }
};
</script>
