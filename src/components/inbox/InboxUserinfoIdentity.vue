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
        type="available"
        show="chat"
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
          | --

    p.c-inbox-userinfo-identity__role(
      v-if="profile.role"
    )
      | {{ profile.role }}

  ul.c-inbox-userinfo-identity__actions(
    v-if="profile.information && profile.information.contact"
  )
    li.c-inbox-userinfo-identity__action(
      v-if="profile.information.contact.phone"
    )
      base-button(
        class="c-inbox-userinfo-identity__action-button"
        icon="phone.fill"
        size="medium"
        reverse
      )
        | Phone

    li.c-inbox-userinfo-identity__action(
      v-if="profile.information.contact.email"
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

export default {
  name: "InboxUserinfoIdentity",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    }
  },

  computed: {
    profile(): ReturnType<typeof Store.$inbox.getProfile> {
      return Store.$inbox.getProfile(this.jid);
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
