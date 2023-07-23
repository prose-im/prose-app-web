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
        size="16px"
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
// NPM
import { PropType } from "vue";
import { JID } from "@xmpp/jid";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "InboxUserinfoSecurity",

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
    entries() {
      const entries = [];

      if (this.profile.security) {
        if (this.profile.security.verification) {
          entries.push({
            id: "identity-verified",
            title: "Identity verified",
            icon: "checkmark.seal.fill"
          });
        } else {
          entries.push({
            id: "identity-unknown",
            title: "Identity unknown",
            icon: "xmark.seal.fill"
          });
        }

        if (this.profile.security.encryption) {
          entries.push({
            id: "encryption-secure",
            title:
              `Encrypted ` +
              `(${this.profile.security.encryption.messageEndToEndMethod})`,
            icon: "lock.fill"
          });
        } else {
          entries.push({
            id: "encryption-insecure",
            title: "Not encrypted",
            icon: "lock.slash.fill"
          });
        }
      }

      return entries;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxUserinfoSectionSecurity(visible);
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
    &--identity-verified {
      fill: $color-base-green-normal;
    }

    &--identity-unknown {
      fill: $color-base-grey-normal;
    }

    &--encryption-secure {
      fill: $color-base-blue-dark;
    }

    &--encryption-insecure {
      fill: $color-base-red-normal;
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
