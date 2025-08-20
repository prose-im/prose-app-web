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
    :class=`[
      "c-inbox-details-user-security-details-identity__disclaimer",
      "u-regular",
      {
        [spacingInlineClass]: spacingInlineClass
      }
    ]`
  )
    | You can always verify user devices in user encryption settings.
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

// CONSTANTS
const QUICKIE_DESCRIPTION_PREFIX = "Prose checked for identity verifications.";

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
      } else if (this.isTrusted === true) {
        detail = {
          icon: "checkmark.seal.fill",
          color: "blue",
          title: `${this.userName} is a member of your workspace`,
          label:
            `${QUICKIE_DESCRIPTION_PREFIX} ` +
            `This user can be trusted, but is not verified.`
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

    isTrusted(): boolean {
      return this.jid.domain === this.selfJID.domain ? true : false;
    },

    userName(): string {
      // Prefer profile-based full name (ie. name from official identity)
      if (this.profile.name?.full) {
        return `${this.profile.name.full.first} ${this.profile.name.full.last}`;
      }

      return this.jid.toString();
    },

    selfJID(): JID {
      return this.account.getSelfJID();
    },

    account(): typeof Store.$account {
      return Store.$account;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
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
