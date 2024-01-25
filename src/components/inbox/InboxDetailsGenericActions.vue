<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-disclosure(
  @toggle="onToggle"
  :header-class="headerClass"
  title="Actions"
  class="c-inbox-details-generic-actions"
  separated
)
  list-button(
    v-for="action in actions"
    @click="action.click ? action.click() : null"
    :key="action.id"
    :class=`[
      "c-inbox-details-generic-actions__action",
      {
        [buttonClass]: buttonClass
      }
    ]`
    :color="action.color"
    :disabled="action.disabled"
    size="small"
    color="lighter"
    emphasis
  )
    template(
      v-slot:default
    )
      | {{ action.title }}

    template(
      v-if="action.navigate"
      v-slot:details
    )
      base-icon(
        name="chevron.right"
        size="8px"
        class="c-inbox-details-generic-actions__action-navigate"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { Room } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: STORES
import Store from "@/store";

// INTERFACES
export interface Action {
  id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  click?: (_: any) => void;
  color?: string;
  navigate?: boolean;
  disabled?: boolean;
}

export default {
  name: "InboxDetailsGenericActions",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    actions: {
      type: Array<Action>,
      required: true,

      validator(x: Array<Action>): boolean {
        return x.length > 0;
      }
    },

    headerClass: {
      type: String,
      default: null
    },

    buttonClass: {
      type: String,
      default: null
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxDetailsSectionActions(visible);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-details-generic-actions";

.c-inbox-details-generic-actions {
  #{$c}__action {
    #{$c}__action-navigate {
      fill: rgb(var(--color-base-grey-dark));
    }
  }
}
</style>
