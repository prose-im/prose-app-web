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
    "c-inbox-userinfo-security-details-identity",
    {
      "c-inbox-userinfo-security-details-identity--verified": isVerified,
      "c-inbox-userinfo-security-details-identity--unknown": !isVerified
    }
  ]`
)
  .c-inbox-userinfo-security-details-identity__quickie
    span.c-inbox-userinfo-security-details-identity__quickie-badge
      base-icon(
        :name="isVerified ? 'checkmark.seal.fill' : 'xmark.seal.fill'"
        size="15px"
        class="c-inbox-userinfo-security-details-identity__quickie-icon"
      )

    .c-inbox-userinfo-security-details-identity__quickie-text
      p.c-inbox-userinfo-security-details-identity__quickie-title.u-medium
        template(
          v-if="isVerified"
        )
          | Looks like this is the real

        template(
          v-else
        )
          | Beware! It might not be the real

        base-space

        | {{ userName }}

      p.c-inbox-userinfo-security-details-identity__quickie-label.u-regular
        | Prose checked on the identity server for matches.

        base-space

        span.u-medium(
          v-if="isVerified"
        )
          | It could verify this user.

        span.u-medium(
          v-else
        )
          | It could not verify this user.

  .c-inbox-userinfo-security-details-identity__disclaimer.u-regular(
    v-if="identityUrl"
  )
    | User data is verified on your identity server, which is

    base-space

    a.u-medium(
      :href="identityUrl"
      target="_blank"
    )
      | {{ identityDomain }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@xmpp/jid";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "InboxUserinfoSecurityDetailsIdentity",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    }
  },

  computed: {
    isVerified(): boolean {
      return this.profile.security && this.profile.security.verification
        ? true
        : false;
    },

    userName(): string {
      if (this.profile.name) {
        return `${this.profile.name.first} ${this.profile.name.last}`;
      } else {
        return this.jid.local;
      }
    },

    identityUrl(): string {
      return `${CONFIG.hosts.identity}/verify/${encodeURIComponent(
        this.jid.toString()
      )}/`;
    },

    identityDomain(): string {
      return new URL(this.identityUrl).hostname;
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
$c: ".c-inbox-userinfo-security-details-identity";

// VARIABLES
$quickie-icon-size: 26px;

.c-inbox-userinfo-security-details-identity {
  #{$c}__quickie,
  #{$c}__disclaimer {
    padding-inline: 14px;
  }

  #{$c}__quickie {
    background-color: $color-background-secondary;
    padding-block: 10px;
    display: flex;
    align-items: flex-start;

    #{$c}__quickie-badge {
      width: $quickie-icon-size;
      height: $quickie-icon-size;
      margin-inline-end: 10px;
      margin-block-start: 2px;
      border-radius: $quickie-icon-size;
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;

      #{$c}__quickie-icon {
        fill: $color-white;
      }
    }

    #{$c}__quickie-text {
      flex: 1;

      #{$c}__quickie-title {
        color: $color-text-primary;
        font-size: 12.5px;
        line-height: 14px;
      }

      #{$c}__quickie-label {
        color: $color-text-secondary;
        font-size: 12px;
        line-height: 13px;
        margin-block-start: 4px;
      }
    }
  }

  #{$c}__disclaimer {
    color: $color-text-primary;
    font-size: 11.5px;
    line-height: 13px;
    border-block-start: 1px solid $color-border-tertiary;
    padding-block: 8px;

    a {
      &:hover {
        text-decoration: underline;
      }
    }
  }

  // --> BOOLEANS <--

  &--verified {
    #{$c}__quickie {
      #{$c}__quickie-badge {
        background-color: $color-base-green-normal;
      }
    }
  }

  &--unknown {
    #{$c}__quickie {
      #{$c}__quickie-badge {
        background-color: $color-base-grey-normal;
      }
    }
  }
}
</style>
