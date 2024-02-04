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
  direction="column"
  class="v-app-spotlight-browse"
)
  .v-app-spotlight-browse__navigate

  .v-app-spotlight-browse__content
    router-view
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
  name: "AppSpotlightBrowse",

  data() {
    return {
      // --> DATA <--

      topbarComponent: shallowRef(SpotlightTopbar),

      topbarProperties: {
        actions: [
          [
            {
              icon: {
                name: "person.crop.circle.badge.plus",
                size: "26px"
              },

              tooltip: "Invite People",
              disabled: true
            },

            {
              icon: {
                name: "rectangle.stack.badge.plus",
                size: "26px"
              },

              tooltip: "New Channel",
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

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-spotlight-browse";

.v-app-spotlight-browse {
  #{$c}__navigate,
  #{$c}__content {
    height: 100%;
  }

  #{$c}__navigate {
    background: red;
    max-width: 240px;
    flex: 0 0 auto;
  }

  #{$c}__content {
    flex: 1;
  }
}
</style>
