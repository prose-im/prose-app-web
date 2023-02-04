<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-item(
  :active="active"
  class="c-sidebar-main-item-user"
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
      | {{ name }}

    base-presence(
      v-if="presence.type === 'available'"
      :type="presence.type",
      :show="presence.show",
      :active="active"
      size="small"
      class="c-sidebar-main-item-user__presence"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "SidebarMainItemUser",

  props: {
    jid: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    active: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    presence() {
      // TODO: those are fixtures, this data should come somewhere from the \
      //   store, based on the user JID!
      if (
        this.jid.startsWith("v") === true ||
        this.jid.startsWith("m") === true ||
        this.jid.startsWith("r") === true
      ) {
        return {
          type: "available",
          show: "chat"
        };
      }

      return {
        type: "unavailable",
        show: "none"
      };
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
  }
}
</style>
