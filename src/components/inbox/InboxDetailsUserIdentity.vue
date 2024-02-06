<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-details-user-identity
  base-avatar(
    :jid="jid"
    class="c-inbox-details-user-identity__avatar"
    size="100px"
  )

  .c-inbox-details-user-identity__details
    p.c-inbox-details-user-identity__name
      base-presence(
        :jid="jid"
        size="small"
        class="c-inbox-details-user-identity__name-presence"
      )

      span.c-inbox-details-user-identity__name-full.u-bold
        | {{ userName }}

    p.c-inbox-details-user-identity__role(
      v-if="profileRole"
    )
      | {{ profileRole }}

  ul.c-inbox-details-user-identity__actions(
    v-if="profilePhoneUrl || profileEmailUrl"
  )
    li.c-inbox-details-user-identity__action(
      v-if="profilePhoneUrl"
    )
      a(
        :href="profilePhoneUrl"
        target="_blank"
        class="c-inbox-details-user-identity__action-link"
      )
        base-button(
          class="c-inbox-details-user-identity__action-button"
          icon="phone.fill"
          size="medium"
          reverse
        )
          | Phone

    li.c-inbox-details-user-identity__action(
      v-if="profileEmailUrl"
    )
      a(
        :href="profileEmailUrl"
        target="_blank"
        class="c-inbox-details-user-identity__action-link"
      )
        base-button(
          class="c-inbox-details-user-identity__action-button"
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
import { JID, Room } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";
import { ProfileEntryInformationContact } from "@/store/tables/profile";

export default {
  name: "InboxDetailsUserIdentity",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    room: {
      type: Object as PropType<Room>,
      required: true
    }
  },

  computed: {
    userName(): string {
      // Prefer profile-based name, since we are showing the full profile here \
      //   (from vCard)
      if (this.profile.name) {
        return `${this.profile.name.first} ${this.profile.name.last}`;
      }

      return this.room.name;
    },

    profileRole(): string | null {
      const employment = this.profile.employment || null;

      if (employment !== null) {
        if (employment.title && employment.organization) {
          return `${employment.title} at ${employment.organization}`;
        }

        return employment.title || employment.organization || null;
      }

      return null;
    },

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
$c: ".c-inbox-details-user-identity";

#{$c} {
  text-align: center;

  #{$c}__avatar {
    margin-block-end: 16px;
  }

  #{$c}__details {
    padding-inline: 8px;
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
        color: rgb(var(--color-text-primary));
      }
    }

    #{$c}__role {
      color: rgb(var(--color-text-secondary));
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
