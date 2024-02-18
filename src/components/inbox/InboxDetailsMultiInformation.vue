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
  title="Information"
  class="c-inbox-details-multi-information"
  separated
)
  list-entry(
    v-for="entry in entries"
    :key="entry.id"
    :selectable="entry.selectable"
    :multi-line="entry.multiLine"
    :class=`{
      [itemClass]: itemClass
    }`
  )
    template(
      v-if="entry.titleHtml"
      v-slot:default
    )
      span(
        v-html="entry.titleHtml"
      )

    template(
      v-else-if="entry.titleText"
      v-slot:default
    )
      | {{ entry.titleText }}

    template(
      v-slot:icon
    )
      base-icon(
        v-if="entry.icon"
        :name="entry.icon"
        size="14px"
        class="c-inbox-details-multi-information__icon"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { Room, RoomMUC } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: STORES
import Store from "@/store";

// INTERFACES
interface Entry {
  id: string;
  titleText?: string;
  titleHtml?: string;
  icon?: string;
  selectable?: boolean;
  multiLine?: boolean;
}

export default {
  name: "InboxDetailsUserInformation",

  props: {
    room: {
      type: Object as PropType<Room>,
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
    entries(): Array<Entry> {
      const entries = [];

      let membersCount = this.room.participants.length,
        topic = (this.room as RoomMUC).subject;

      if (topic) {
        entries.push({
          id: "topic",
          titleHtml: this.$filters.string.textIntoMultiLineHtml(topic),
          icon: "megaphone.fill",
          selectable: true,
          multiLine: true
        });
      }

      entries.push({
        id: "members",
        titleText: membersCount === 1 ? "1 member" : `${membersCount} members`,
        icon: "person.fill.viewfinder"
      });

      return entries;
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxDetailsSectionInformation(visible);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-details-multi-information";

#{$c} {
  #{$c}__icon {
    fill: lighten-var(var(--color-base-grey-dark), 10%);
  }
}
</style>
