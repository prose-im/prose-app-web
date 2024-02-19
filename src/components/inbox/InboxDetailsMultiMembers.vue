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
    v-for="member in members"
    @click="onMemberClick(member)"
    :class=`[
      "c-inbox-details-multi-members__member",
      {
        [buttonClass]: buttonClass
      }
    ]`
    size="small"
  )
    template(
      v-slot:icon
    )
      base-avatar(
        v-if="member.jid"
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
        :availability="member.availability"
        size="tiny"
        class="c-inbox-details-multi-members__presence"
        hide-offline
      )

  list-button(
    v-if="hasAddMember"
    @click="onAddMemberClick"
    :class=`[
      "c-inbox-details-multi-members__add",
      {
        [buttonClass]: buttonClass
      }
    ]`
    size="small"
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
import { Room, ParticipantInfo, Availability } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";
import { firstBy } from "thenby";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: STORES
import Store from "@/store";

// CONSTANTS
const MEMBER_AVAILABILITY_PRIORITIES = {
  [Availability.Available]: 0,
  [Availability.DoNotDisturb]: 1,
  [Availability.Away]: 2,
  [Availability.Unavailable]: 2
};

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
    },

    buttonClass: {
      type: String,
      default: null
    }
  },

  emits: ["add"],

  computed: {
    hasAddMember(): boolean {
      return this.type === "channel";
    },

    members(): Array<ParticipantInfo> {
      // Sort participants:
      //  - By most available first
      //  - Then by name (alphabetically)
      //  - Finally by JID for sort stability on 2 same names
      // Notice: the sort by JID step is only triggered if comparing two names \
      //   that are equal or alike, in order to tell them apart. It means \
      //   that this step is only rarely executed, which is okay \
      //   performance-wise since it is known to be a little bit more expensive.
      return [...this.room.participants].sort(
        firstBy((participant: ParticipantInfo) => {
          return MEMBER_AVAILABILITY_PRIORITIES[participant.availability];
        })
          .thenBy("name", { ignoreCase: true })
          .thenBy((participant: ParticipantInfo) => {
            return participant.jid?.toString() || "";
          })
      );
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxDetailsSectionMembers(visible);
    },

    onMemberClick(member: ParticipantInfo): void {
      if (member.isSelf === true) {
        BaseAlert.warning("This is you", "Cannot start a chat with yourself!");
      } else if (!member.jid) {
        BaseAlert.warning("Anonymous member", "Member is not open for DMs");
      } else {
        this.$router.push({
          name: "app.inbox",
          params: { roomId: member.jid.toString() }
        });
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

#{$c} {
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
