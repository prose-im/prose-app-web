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
  class="c-inbox-details-multi-members"
  separated
)
  list-button(
    v-for="member in room.participants"
    @click="onMemberClick(member.jid)"
    size="small"
    class="c-inbox-details-multi-members__member"
  )
    template(
      v-slot:icon
    )
      base-avatar(
        :jid="member.jid"
        class="c-inbox-details-multi-members__avatar"
        size="20px"
        shadow="none"
      )

    template(
      v-slot:default
    )
      span.c-inbox-details-multi-members__name.u-ellipsis
        | {{ member.name }}

      base-presence(
        :jid="member.jid"
        size="tiny"
        class="c-inbox-details-multi-members__presence"
        available-only
      )

  list-button(
    v-if="hasAddMember"
    @click="onAddMemberClick"
    size="small"
    class="c-inbox-details-multi-members__add"
    emphasis
  )
    template(
      v-slot:icon
    )
      base-icon(
        name="plus.square.fill"
        size="12px"
        class="c-inbox-details-multi-members__icon"
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
import { JID, Room } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "InboxDetailsUserMembers",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    headerClass: {
      type: String,
      default: null
    }
  },

  emits: ["add"],

  computed: {
    hasAddMember(): boolean {
      return this.type === "channel";
    },

    selfJID(): JID {
      return this.account.getLocalJID();
    },

    account(): typeof Store.$account {
      return Store.$account;
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxDetailsSectionMembers(visible);
    },

    onMemberClick(jid: JID): void {
      if (jid.equals(this.selfJID) === false) {
        this.$router.push({
          name: "app.inbox",
          params: { roomId: jid.toString() }
        });
      } else {
        BaseAlert.info("This is you", "Cannot start a chat with yourself!");
      }
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
$c: ".c-inbox-details-multi-members";

.c-inbox-details-multi-members {
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
