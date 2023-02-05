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
  :header-class="headerClass"
  title="Information"
  class="c-inbox-userinfo-information"
  separated
)
  list-entry(
    v-for="entry in entries"
    :key="entry.id"
    :class=`{
      [itemClass]: itemClass
    }`
  )
    | {{ entry.title }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxUserinfoInformation",

  props: {
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
    entries() {
      return [
        {
          id: "email",
          title: "valerian@crisp.chat"
        },

        {
          id: "phone",
          title: "+33631210280"
        },

        {
          id: "active",
          title: "Active 1 min ago"
        },

        {
          id: "timezone",
          title: "5:03pm (UTC+1)"
        },

        {
          id: "location",
          title: "Lisbon, Portugal"
        },

        {
          id: "activity",
          title: "Focusing on code"
        }
      ];
    }
  }
};
</script>
