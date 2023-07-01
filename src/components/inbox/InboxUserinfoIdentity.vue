<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-userinfo-identity
  base-avatar(
    :jid="jid"
    class="c-inbox-userinfo-identity__avatar"
    size="100px"
  )

  .c-inbox-userinfo-identity__details
    p.c-inbox-userinfo-identity__name
      base-presence(
        class="c-inbox-userinfo-identity__name-presence"
        :jid="jid"
        size="small"
      )

      span.c-inbox-userinfo-identity__name-full.u-bold
        template(
          v-if="profile.name"
        )
          | {{ profile.name.first }} {{ profile.name.last }}

        template(
          v-else
        )
          | {{ jid.local }}

    p.c-inbox-userinfo-identity__role(
      v-if="profile.role"
    )
      | {{ profile.role }}

  ul.c-inbox-userinfo-identity__actions(
    v-if="profilePhoneUrl || profileEmailUrl"
  )
    li.c-inbox-userinfo-identity__action(
      v-if="profilePhoneUrl"
    )
      a(
        :href="profilePhoneUrl"
        target="_blank"
        class="c-inbox-userinfo-identity__action-link"
      )
        base-button(
          class="c-inbox-userinfo-identity__action-button"
          icon="phone.fill"
          size="medium"
          reverse
        )
          | Phone

    li.c-inbox-userinfo-identity__action(
      v-if="profileEmailUrl"
    )
      a(
        :href="profileEmailUrl"
        target="_blank"
        class="c-inbox-userinfo-identity__action-link"
      )
        base-button(
          class="c-inbox-userinfo-identity__action-button"
          icon="envelope.fill"
          size="medium"
          reverse
        )
          | Email
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
import { ProfileEntryInformationContact } from "@/store/tables/profile";

export default {
  name: "InboxUserinfoIdentity",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    }
  },

  computed: {
    profilePhoneUrl(): string | null {
      if (this.profileContact !== null && this.profileContact.phone) {
        return `tel:${this.profileContact.phone}`;
      }

      return null;
    },

    profileEmailUrl(): string | null {
      if (this.profileContact !== null && this.profileContact.email) {
        return `mailto:${this.profileContact.email}`;
      }

      return null;
    },

    profileContact(): ProfileEntryInformationContact | null {
      if (this.profile.information && this.profile.information.contact) {
        return this.profile.information.contact;
      }

      return null;
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
$c: ".c-inbox-userinfo-identity";

.c-inbox-userinfo-identity {
  text-align: center;

  #{$c}__avatar {
    margin-block-end: 16px;
  }

  #{$c}__details {
    margin-block-end: 20px;

    #{$c}__name {
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;

      #{$c}__name-presence {
        margin-inline-end: 4px;
        margin-block-start: 1px;
        flex: 0 0 auto;
      }

      #{$c}__name-full {
        color: $color-text-primary;
      }
    }

    #{$c}__role {
      color: $color-text-secondary;
      font-size: 13px;
      margin-block-start: 6px;
    }
  }

  #{$c}__actions {
    #{$c}__action {
      margin-inline: 4px;
      display: inline-block;

      &:first-child {
        margin-inline-start: 0;
      }

      &:last-child {
        margin-inline-end: 0;
      }
    }
  }
}
</style>
