<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-details-user-security-details-identity
  div(
    :class=`[
      "c-inbox-details-user-security-details-identity__quickie",
      {
        [spacingBlockClass]: spacingBlockClass,
        [spacingInlineClass]: spacingInlineClass
      }
    ]`
  )
    base-badge-details(
      :details="quickieDetails"
    )

  div(
    v-if="identityUrl"
    :class=`[
      "c-inbox-details-user-security-details-identity__disclaimer",
      "u-regular",
      {
        [spacingInlineClass]: spacingInlineClass
      }
    ]`
  )
    | User data is verified on your identity server, which is

    base-space

    a.u-medium(
      @click="onIdentityDomainClick"
    )
      | {{ identityDomain }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, Room } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import { Detail as BadgeDetail } from "@/components/base/BaseBadgeDetails.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

// CONSTANTS
const QUICKIE_DESCRIPTION_PREFIX =
  "Prose checked on the identity server for matches.";

export default {
  name: "InboxDetailsUserSecurityDetailsIdentity",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    room: {
      type: Object as PropType<Room>,
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
    quickieDetails(): Array<BadgeDetail> {
      let detail: BadgeDetail;

      if (this.isVerified === true) {
        detail = {
          icon: "checkmark.seal.fill",
          color: "green",
          title: `Looks like this is the real ${this.userName}`,
          label: `${QUICKIE_DESCRIPTION_PREFIX} It could verify this user.`
        };
      } else {
        detail = {
          icon: "xmark.seal.fill",
          color: "grey",
          title: `Beware! It might not be the real ${this.userName}`,
          label: `${QUICKIE_DESCRIPTION_PREFIX} It could not verify this user.`
        };
      }

      return [detail];
    },

    isVerified(): boolean {
      return this.profile.security && this.profile.security.verification
        ? true
        : false;
    },

    userName(): string {
      // Prefer profile-based full name (ie. name from official identity)
      if (this.profile.name?.full) {
        return `${this.profile.name.full.first} ${this.profile.name.full.last}`;
      }

      return this.jid.toString();
    },

    identityUrl(): string {
      return `https://${this.jid.domain}/identity/verify/${encodeURIComponent(
        this.jid.toString()
      )}/`;
    },

    identityDomain(): string {
      return new URL(this.identityUrl).hostname;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    async onIdentityDomainClick(): Promise<void> {
      try {
        await UtilitiesRuntime.requestOpenUrl(this.identityUrl);
      } catch (error) {
        this.$log.error(
          `Failed opening identity server URL: ${this.identityUrl}`,
          error
        );
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-details-user-security-details-identity";

// VARIABLES
$quickie-icon-size: 26px;

#{$c} {
  #{$c}__quickie {
    background-color: rgb(var(--color-background-secondary));
  }

  #{$c}__disclaimer {
    color: rgb(var(--color-text-primary));
    font-size: ($font-size-baseline - 2.5px);
    line-height: 13px;
    border-block-start: 1px solid rgb(var(--color-border-tertiary));
    padding-block: 8px;

    a {
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
