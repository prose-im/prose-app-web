<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-button(
  @click="onButtonClick"
  :active="active"
  :important="item.hasDraft || item.unreadCount > 0 || item.mentionsCount > 0"
  :class=`[
    "c-sidebar-main-item-user",
    {
      "c-sidebar-main-item-user--active": active
    }
  ]`
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
      available-only
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

  template(
    v-if="item.error || item.hasDraft || item.unreadCount > 0 || item.mentionsCount > 0"
    v-slot:details
  )
    base-tooltip(
      v-if="item.error"
      :tooltip="item.error"
      align="right"
    )
      base-icon(
        name="exclamationmark.triangle.fill"
        size="15px"
        class="c-sidebar-main-item-user__error"
      )

    base-tooltip(
      v-if="item.hasDraft"
      align="right"
      tooltip="Draft Pending"
    )
      base-icon(
        name="pencil"
        size="12px"
        class="c-sidebar-main-item-user__draft"
      )

    base-count(
      v-if="item.mentionsCount > 0"
      :color="countColor"
      icon="at"
    )

    base-count(
      v-else-if="item.unreadCount > 0"
      :count="item.unreadCount"
      :color="countColor"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, SidebarItem } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "SidebarMainItemUser",

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
    countColor(): string {
      return this.active === true ? "white" : "blue";
    },

    statusActivity(): ReturnType<typeof Store.$activity.getActivity> {
      return Store.$activity.getActivity(this.jid);
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onButtonClick(): void {
      this.$router.push({
        name: "app.inbox",
        params: { roomId: this.jid.toString() }
      });
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

  #{$c}__draft {
    fill: rgb(var(--color-base-grey-dark));
  }

  #{$c}__error {
    fill: rgb(var(--color-base-orange-normal));
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__draft,
    #{$c}__error {
      fill: rgb(var(--color-white));
    }
  }
}
</style>
