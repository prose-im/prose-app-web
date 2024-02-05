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
      "c-sidebar-main-item-user--blocked": rosterBlockListBlocked
    }
  ]`
  :item="item"
  :active="active"
)
  template(
    v-slot:icon
  )
    base-avatar(
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
      align="left"
      class="c-sidebar-main-item-user__activity"
    )
      template(
        v-slot:tooltip
      )
        | {{ statusActivity.status.text }}

      template(
        v-slot:default
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

    active: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    statusActivity(): ReturnType<typeof Store.$activity.getActivity> {
      return Store.$activity.getActivity(this.jid);
    },

    rosterBlockListBlocked(): boolean {
      return (
        Store.$roster.getBlockListStatus(this.jid) ===
        RosterBlockListStatus.Blocked
      );
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-sidebar-main-item-user";

.c-sidebar-main-item-user {
  #{$c}__avatar {
    display: block;
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

  &--blocked {
    #{$c}__name {
      text-decoration: line-through;
      text-decoration-thickness: 1px;
    }
  }
}
</style>
