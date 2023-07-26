<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "c-inbox-userinfo-security-details-encryption",
    {
      [spacingBlockClass]: spacingBlockClass,
      [spacingInlineClass]: spacingInlineClass
    }
  ]`
)
  base-badge-details(
    :details="details"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@xmpp/jid";

// PROJECT: COMPONENTS
import { Detail as BadgeDetail } from "@/components/base/BaseBadgeDetails.vue";

// PROJECT: STORES
import Store from "@/store";
import { ProfileEntrySecurityEncryption } from "@/store/tables/profile";

export default {
  name: "InboxUserinfoSecurityDetailsEncryption",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    spacingBlockClass: {
      type: String,
      default: null
    },

    spacingInlineClass: {
      type: String,
      default: null
    }
  },

  computed: {
    details(): Array<BadgeDetail> {
      const encryption: ProfileEntrySecurityEncryption =
        this.profile.security?.encryption || {};

      // Initialize details
      const details = [];

      // Append client-to-server encryption status
      if (encryption.connectionProtocol) {
        details.push({
          icon: "key.fill",
          color: "green",
          title: `Connected to server over ${encryption.connectionProtocol}`,
          label:
            "Someone tapping the network will not be able to read what is sent. Perfect!"
        });
      } else {
        details.push({
          icon: "key.fill", // TODO
          color: "red",
          title: "Connected to server with no encryption",
          label:
            "This is very insecure! Anyone tapping the network can see everything you send and receive."
        });
      }

      // Append end-to-end encryption status
      if (encryption.messageEndToEndMethod) {
        details.push({
          icon: "lock.fill",
          color: "blue",
          title: `Messages are end-to-end encrypted with ${encryption.messageEndToEndMethod}`,
          label:
            "Server owners cannot read messages. This is the best level of security."
        });
      } else {
        details.push({
          icon: "lock.fill", // TODO
          color: "grey",
          title: "Messages are not end-to-end encrypted",
          label:
            "Server owners could read your messages. This is okay if you trust your server."
        });
      }

      return details;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    }
  }
};
</script>
