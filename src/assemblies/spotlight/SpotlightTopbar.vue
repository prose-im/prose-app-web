<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-toolbar(
  class="a-spotlight-topbar"
  draggable
)
  template(
    v-slot:left
  )
    topbar-actions-history

  template(
    v-slot:right
  )
    template(
      v-for="actionGroup in actions"
    )
      base-tooltip(
        v-for="action in actionGroup"
        :tooltip="action.tooltip"
        align="right"
        direction="bottom"
      )
        base-action(
          @click="action.click ? action.click() : null"
          :icon="action.icon.name"
          :size="action.icon.size"
          :disabled="action.disabled"
          context="grey"
        )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";

// PROJECT: COMPONENTS
import TopbarActionsHistory from "@/components/topbar/TopbarActionsHistory.vue";

// PROJECT: COMPOSABLES
import { useInterfaceMounted } from "@/composables/interface";

// PROJECT: STORES
import Store from "@/store";

// TYPES
export type Actions = Array<Array<Action>>;

// INTERFACES
export interface Action {
  icon: {
    name: string;
    size: string;
  };

  tooltip: string;
  click?: (() => void) | (() => Promise<void>);
  disabled?: boolean;
}

export default {
  name: "SpotlightTopbar",

  components: { TopbarActionsHistory },

  props: {
    actions: {
      type: Array as PropType<Actions>,

      default(): Actions {
        return [];
      }
    }
  },

  setup() {
    useInterfaceMounted((mounted: boolean) => {
      Store.$session.setInterfaceToolbarMounted(mounted);
    });
  }
};
</script>
