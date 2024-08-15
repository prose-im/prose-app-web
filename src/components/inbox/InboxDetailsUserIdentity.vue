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
      base-button(
        @click="onActionClick(profilePhoneUrl)"
        class="c-inbox-details-user-identity__action-button"
        icon="phone.fill"
        size="medium"
        reverse
      )
        | Phone

    li.c-inbox-details-user-identity__action(
      v-if="profileEmailUrl"
    )
      base-button(
        @click="onActionClick(profileEmailUrl)"
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

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  RuntimeUrlOpenTarget
} from "@/utilities/runtime";

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
      //   from vCard. Set priority on user-defined given name, or else use \
      //   user full name.
      if (this.profile.name?.nick) {
        return this.profile.name.nick;
      }

      if (this.profile.name?.full) {
        return `${this.profile.name.full.first} ${this.profile.name.full.last}`;
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
  },

  methods: {
    // --> EVENT LISTENERS <--

    async onActionClick(actionUrl: string): Promise<void> {
      try {
        await UtilitiesRuntime.requestOpenUrl(
          actionUrl,
          RuntimeUrlOpenTarget.Self
        );
      } catch (error) {
        this.$log.error(`Failed opening action URL: ${actionUrl}`, error);
      }
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
    margin-block-end: 15px;
  }

  #{$c}__details {
    padding-inline: 8px;
    margin-block-end: 18px;

    #{$c}__name {
      font-size: ($font-size-baseline + 1px);
      line-height: 17px;
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
      font-size: ($font-size-baseline - 1px);
      line-height: 16px;
      margin-block-start: 4px;
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
