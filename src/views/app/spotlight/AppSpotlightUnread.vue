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
  .v-app-spotlight-unread__content
    list-browse(
      :class=`[
        "v-app-spotlight-unread__content-inner",
        {
          "v-app-spotlight-unread__content-inner--empty": groups.length === 0
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
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: ASSEMBLIES
import {
  default as SpotlightTopbar,
  Actions as SpotlightTopbarActions
} from "@/assemblies/spotlight/SpotlightTopbar.vue";

// PROJECT: COMPONENTS
import BaseAvatar from "@/components/base/BaseAvatar.vue";
import BaseButton from "@/components/base/BaseButton.vue";
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
    padding-inline: $size-layout-view-content-padding-sides;
    overflow-x: hidden;
    overflow-y: auto;
    flex: 1;

    #{$c}__content-inner {
      max-width: 860px;
      margin: 0 auto;

      &--empty {
        height: 100%;
        width: 100%;
        padding-block: 0;
      }
    }
  }
}
</style>
