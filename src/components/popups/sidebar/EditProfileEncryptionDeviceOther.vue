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
  :styles="table.styles"
  :controls="table.controls"
  :class=`[
    "p-edit-profile-encryption-device-other",
    dataTableClass
  ]`
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
  Styles as DataTableStyles,
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
            label: "Security Code"
          }
        ] as Array<DataTableColumn>,

        rows: [
          // TODO: add actual data
          /* {
            selected: false,

            columns: {
              name: "Unknown Device #1",
              device: "(none)",
              hash: "1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣"
            }
          } */
        ] as Array<DataTableRow>,

        sizes: { name: "40%", device: "20%", hash: "40%" } as DataTableSizes,

        styles: {
          hash: { fontSize: "18px", cursor: "text" }
        } as DataTableStyles,

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

    onDataTableControlClick(): void {
      // TODO: handle action for type
    }
  }
};
</script>
