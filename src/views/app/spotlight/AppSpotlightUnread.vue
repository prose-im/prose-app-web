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
  list-browse(
    :class=`[
      "v-app-spotlight-unread__content",
      {
        "v-app-spotlight-unread__content--empty": groups.length === 0
      }
    ]`
    :groups="groups"
    empty-illustration="inbox-empty"
    empty-title="Inbox Zero!"
    empty-description="There are no pending messages to process. Unread messages will appear here."
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

// PROJECT: COMPONENTS
import { Groups as ListBrowseGroups } from "@/components/list/ListBrowse.vue";

// PROJECT: COMPOSABLES
import { useInterfaceTitle } from "@/composables/interface";

export default {
  name: "AppSpotlightUnread",

  setup() {
    useInterfaceTitle("Unread Stack");
  },

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
  },

  computed: {
    groups(): ListBrowseGroups {
      const groups: ListBrowseGroups = [];

      // TODO: populate

      return groups;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-spotlight-unread";

#{$c} {
  #{$c}__content {
    padding-block: $size-spotlight-browse-padding-block-start
      $size-spotlight-browse-padding-block-end;

    &--empty {
      height: 100%;
      width: 100%;
      padding-block: 0;
    }
  }
}
</style>
