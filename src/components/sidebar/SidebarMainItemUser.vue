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
  :important="unreadCount > 0"
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
    v-if="unreadCount > 0"
    v-slot:details
  )
    base-count(
      :count="unreadCount"
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
    unreadCount() {
      // TODO: those are fixtures, this data should come somewhere from the \
      //   store, based on the user JID!
      if (this.jid.startsWith("m") === true) {
        return 8;
      }

      if (this.jid.startsWith("s") === true) {
        return 15;
      }

      return 0;
    },

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
  },

  methods: {
    // --> EVENT LISTENERS <--

    onButtonClick(): void {
      this.$router.push({
        name: "app.inbox",
        params: { jid: this.jid }
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
  }
}
</style>
