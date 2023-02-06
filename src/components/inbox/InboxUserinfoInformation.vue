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
    :color="entry.emoji ? 'lighter' : 'normal'"
    :class=`{
      [itemClass]: itemClass
    }`
  )
    template(
      v-slot:default
    )
      | {{ entry.title }}

    template(
      v-slot:icon
    )
      base-icon(
        v-if="entry.icon"
        :name="entry.icon"
        size="14px"
        class="c-inbox-userinfo-information__icon"
      )

      span.c-inbox-userinfo-information__emoji
        | {{ entry.emoji }}
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
          title: "valerian@crisp.chat",
          icon: "envelope.fill"
        },

        {
          id: "phone",
          title: "+33631210280",
          icon: "iphone"
        },

        {
          id: "active",
          title: "Active 1 min ago",
          icon: "hand.wave.fill"
        },

        {
          id: "timezone",
          title: "5:03pm (UTC+1)",
          icon: "clock.fill"
        },

        {
          id: "location",
          title: "Lisbon, Portugal",
          icon: "location.fill"
        },

        {
          id: "activity",
          title: "Focusing on code",
          emoji: "👨‍💻"
        }
      ];
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-userinfo-information";

.c-inbox-userinfo-information {
  #{$c}__icon {
    fill: lighten($color-base-grey-dark, 10%);
  }

  #{$c}__emoji {
    font-size: 18px;
  }
}
</style>
