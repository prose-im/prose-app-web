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
          :dropdown="action.dropdown ? true : false"
          :disabled="action.disabled"
          context="grey"
        )

      base-separator

    topbar-actions-search
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";

// PROJECT: COMPONENTS
import TopbarActionsHistory from "@/components/topbar/TopbarActionsHistory.vue";
import TopbarActionsSearch from "@/components/topbar/TopbarActionsSearch.vue";

// TYPES
export type Actions = Array<Array<Action>>;

// INTERFACES
export interface Action {
  icon: {
    name: string;
    size: string;
  };

  tooltip: string;
  dropdown: Array<void>;
  click?: () => void;
  disabled?: boolean;
}

export default {
  name: "SpotlightTopbar",

  components: { TopbarActionsHistory, TopbarActionsSearch },

  props: {
    actions: {
      type: Array as PropType<Actions>,

      default(): Actions {
        return [];
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-spotlight-topbar";
</style>
