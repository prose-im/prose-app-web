<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
sidebar-main-item-generic(
  :class=`[
    "c-sidebar-main-item-user",
    {
      "c-sidebar-main-item-user--active": active,
      "c-sidebar-main-item-user--blocked": rosterBlockListBlocked
    }
  ]`
  :item="item"
  :translucent="translucent"
  :active="active"
)
  template(
    v-slot:icon
  )
    .c-sidebar-main-item-user__composing(
      v-if="hasComposing"
    )
      span.c-sidebar-main-item-user__composing-dot.u-animate.u-animate--fade-in-out(
        v-for="_ in 3"
      )

    base-avatar(
      v-show="!hasComposing"
      :jid="jid"
      class="c-sidebar-main-item-user__avatar"
      size="22px"
      shadow="none"
    )

  template(
    v-slot:default
  )
    span.c-sidebar-main-item-user__name
      | {{ item.name }}

    base-presence(
      :jid="jid"
      :active="active"
      size="small"
      class="c-sidebar-main-item-user__presence"
      hide-offline
    )

    base-tooltip(
      v-if="statusActivity.status"
      :bypassed="!statusActivity.status.text"
      :tooltip="statusActivity.status.text"
      align="left"
      class="c-sidebar-main-item-user__activity"
    )
      span(
        class="c-sidebar-main-item-user__activity-icon"
      )
        | {{ statusActivity.status.icon }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, SidebarItem } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: COMPONENTS
import SidebarMainItemGeneric from "@/components/sidebar/SidebarMainItemGeneric.vue";

// PROJECT: STORES
import Store from "@/store";
import { RosterBlockListStatus } from "@/store/tables/roster";

export default {
  name: "SidebarMainItemUser",

  components: { SidebarMainItemGeneric },

  props: {
    item: {
      type: Object as PropType<SidebarItem>,
      required: true
    },

    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    translucent: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    hasComposing(): boolean {
      return this.states.composing.length > 0;
    },

    statusActivity(): ReturnType<typeof Store.$activity.getActivity> {
      return Store.$activity.getActivity(this.jid);
    },

    rosterBlockListBlocked(): boolean {
      return (
        Store.$roster.getBlockListStatus(this.jid) ===
        RosterBlockListStatus.Blocked
      );
    },

    states(): ReturnType<typeof Store.$inbox.getStates> {
      return Store.$inbox.getStates(this.item.room.id);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-main-item-user";

// VARIABLES
$composing-dot-size: 3px;

#{$c} {
  #{$c}__avatar {
    display: block;
  }

  #{$c}__composing {
    gap: 2px;
    display: flex;
    align-items: center;
    justify-content: center;

    #{$c}__composing-dot {
      background-color: rgb(var(--color-base-blue-dark));
      width: $composing-dot-size;
      height: $composing-dot-size;
      flex: 0 0 auto;
      animation-duration: 2s;
      animation-iteration-count: infinite;

      &:nth-child(2) {
        animation-delay: 0.4s;
      }

      &:nth-child(3) {
        animation-delay: 0.8s;
      }
    }
  }

  #{$c}__presence {
    margin-inline-start: 5px;
    margin-block-start: 2px;
    flex: 0 0 auto;
  }

  #{$c}__activity {
    margin-inline-start: 9px;
    margin-block-start: 2px;

    #{$c}__activity-icon {
      font-size: 16px;
    }
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__composing {
      #{$c}__composing-dot {
        background-color: rgb(var(--color-white));
      }
    }
  }

  &--blocked {
    #{$c}__name {
      text-decoration: line-through;
      text-decoration-thickness: 1px;
    }
  }
}
</style>
