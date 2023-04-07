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
  class="c-inbox-userinfo-actions"
  separated
)
  list-button(
    v-for="action in actions"
    :key="action.id"
    :class=`[
      "c-inbox-userinfo-actions__action",
      {
        [itemClass]: itemClass
      }
    ]`
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
        class="c-inbox-userinfo-actions__action-navigate"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@xmpp/jid";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "InboxUserinfoActions",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    headerClass: {
      type: String,
      default: null
    },

    itemClass: {
      type: String,
      default: null
    }
  },

  computed: {
    actions() {
      return [
        {
          id: "files",
          title: "View shared files",
          navigate: true
        },

        {
          id: "encryption",
          title: "Encryption settings",
          navigate: true
        },

        {
          id: "remove",
          title: "Remove from contacts"
        },

        {
          id: "block",
          title: "Block contact"
        }
      ];
    },

    profile(): ReturnType<typeof Store.$inbox.getProfile> {
      // TODO: jid from url
      return Store.$inbox.getProfile(this.jid);
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxUserinfoSectionActions(visible);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-userinfo-actions";

.c-inbox-userinfo-actions {
  #{$c}__action {
    #{$c}__action-navigate {
      fill: $color-base-grey-dark;
    }
  }
}
</style>
