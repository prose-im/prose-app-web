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
        :class=`[
          "c-inbox-userinfo-security__icon",
          "c-inbox-userinfo-security__icon--" + entry.id
        ]`
        size="14px"
      )

    template(
      v-slot:details
    )
      base-icon(
        name="info.circle"
        size="13px"
        class="c-inbox-userinfo-security__details"
      )
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
          title: "Identity verified",
          icon: "checkmark.seal.fill"
        },

        {
          id: "encryption",
          title: "Encrypted (C648A)",
          icon: "lock.fill"
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
$c: ".c-inbox-userinfo-security";

.c-inbox-userinfo-security {
  #{$c}__icon {
    &--identity {
      fill: $color-base-green-normal;
    }

    &--encryption {
      fill: $color-base-blue-dark;
    }
  }

  #{$c}__details {
    fill: rgba($color-base-grey-dark, 0.65);
    cursor: pointer;

    &:hover {
      fill: rgba($color-base-grey-dark, 0.8);
    }

    &:active {
      fill: $color-base-grey-dark;
    }
  }
}
</style>
