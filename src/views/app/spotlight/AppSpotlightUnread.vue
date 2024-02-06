<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-view(
  :topbar-component="topbarComponent"
  :topbar-properties="topbarProperties"
  class="v-app-spotlight-unread"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";

// PROJECT: ASSEMBLIES
import {
  default as SpotlightTopbar,
  Actions as SpotlightTopbarActions
} from "@/assemblies/spotlight/SpotlightTopbar.vue";

export default {
  name: "AppSpotlightUnread",

  data() {
    return {
      // --> DATA <--

      topbarComponent: shallowRef(SpotlightTopbar),

      topbarProperties: {
        actions: [
          [
            {
              icon: {
                name: "envelope.open",
                size: "20px"
              },

              tooltip: "Mark All as Read",
              disabled: true
            }
          ],

          [
            {
              icon: {
                name: "line.3.horizontal.decrease.circle",
                size: "18px"
              },

              tooltip: "More Actions",
              dropdown: [],
              disabled: true
            }
          ]
        ] as SpotlightTopbarActions
      }
    };
  }
};
</script>
