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
    :columns="table.columns"
    :rows="table.rows"
    :sizes="table.sizes"
    :class="dataTableClass"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import {
  Column as DataTableColumn,
  Row as DataTableRow
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
          // TODO: from dynamic data

          {
            selected: false,
            name: "Prose (iPhone Valerian)",
            device: "938173",
            hash: "Z29QD"
          },

          {
            selected: false,
            name: "Prose (iPad Valerian)",
            device: "163012",
            hash: "OB21A"
          },

          {
            selected: false,
            name: "Gajim (Ubuntu VM)",
            device: "129",
            hash: "AQW02"
          }
        ] as Array<DataTableRow>,

        sizes: ["40%", "25%", "35%"]
      }
    };
  }
};
</script>
