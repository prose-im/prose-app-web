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
  title="Members"
  class="c-inbox-details-group-members"
  separated
)
  list-button(
    v-for="member in room.members"
    @click="onMemberClick(member.jid)"
    size="small"
    class="c-inbox-details-group-members__member"
  )
    template(
      v-slot:icon
    )
      base-avatar(
        :jid="member.jid"
        class="c-inbox-details-group-members__avatar"
        size="20px"
        shadow="none"
      )

    template(
      v-slot:default
    )
      span.c-inbox-details-group-members__name.u-ellipsis
        | {{ member.name }}

      base-presence(
        :jid="member.jid"
        size="tiny"
        class="c-inbox-details-group-members__presence"
        available-only
      )

  list-button(
    @click="onAddMemberClick"
    size="small"
    class="c-inbox-details-group-members__add"
    emphasis
  )
    template(
      v-slot:icon
    )
      base-icon(
        name="plus.square.fill"
        size="12px"
        class="c-inbox-details-group-members__icon"
      )

    template(
      v-slot:default
    )
      | Add members
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { Room } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "InboxDetailsUserMembers",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    headerClass: {
      type: String,
      default: null
    }
  },

  emits: ["add"],

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxDetailsSectionMembers(visible);
    },

    onMemberClick(jid: JID): void {
      this.$router.push({
        name: "app.inbox",
        params: { roomId: jid.toString() }
      });
    },

    onAddMemberClick(): void {
      this.$emit("add");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-details-group-members";

.c-inbox-details-group-members {
  #{$c}__member {
    #{$c}__presence {
      margin-inline-start: 4px;
      margin-block-start: 3px;
      flex: 0 0 auto;
    }
  }

  #{$c}__add {
    #{$c}__icon {
      fill: rgb(var(--color-base-blue-dark));
    }
  }
}
</style>
