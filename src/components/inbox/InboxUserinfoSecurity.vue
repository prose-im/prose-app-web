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
  title="Security"
  class="c-inbox-userinfo-security"
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
  name: "InboxUserinfoSecurity",

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
          id: "identity",
          title: "Identity verified"
        },

        {
          id: "encryption",
          title: "Encrypted (C648A)"
        }
      ];
    }
  }
};
</script>
