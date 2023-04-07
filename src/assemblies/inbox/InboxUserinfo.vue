<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.a-inbox-userinfo
  inbox-userinfo-identity(
    :jid="jid"
    class="a-inbox-userinfo__identity"
  )

  inbox-userinfo-information(
    :jid="jid"
    :expanded="layout.inbox.userinfo.sections.information"
    class="a-inbox-userinfo__block a-inbox-userinfo__block--information"
    header-class="a-inbox-userinfo__block-header"
    item-class="a-inbox-userinfo__block-item"
  )

  inbox-userinfo-security(
    :jid="jid"
    :expanded="layout.inbox.userinfo.sections.security"
    class="a-inbox-userinfo__block a-inbox-userinfo__block--security"
    header-class="a-inbox-userinfo__block-header"
    item-class="a-inbox-userinfo__block-item"
  )

  inbox-userinfo-actions(
    :jid="jid"
    :expanded="layout.inbox.userinfo.sections.actions"
    class="a-inbox-userinfo__block a-inbox-userinfo__block--actions"
    header-class="a-inbox-userinfo__block-header"
    item-class="a-inbox-userinfo__block-item"
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

// PROJECT: COMPONENTS
import InboxUserinfoIdentity from "@/components/inbox/InboxUserinfoIdentity.vue";
import InboxUserinfoInformation from "@/components/inbox/InboxUserinfoInformation.vue";
import InboxUserinfoSecurity from "@/components/inbox/InboxUserinfoSecurity.vue";
import InboxUserinfoActions from "@/components/inbox/InboxUserinfoActions.vue";

export default {
  name: "InboxUserinfo",

  components: {
    InboxUserinfoIdentity,
    InboxUserinfoInformation,
    InboxUserinfoSecurity,
    InboxUserinfoActions
  },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    }
  },

  computed: {
    layout(): typeof Store.$layout {
      return Store.$layout;
    }
  },

  watch: {
    jid: {
      immediate: true,

      handler(value: JID) {
        // TODO: re-assert store
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-inbox-userinfo";

// VARIABLES
$userinfo-item-padding-sides: 15px;

.a-inbox-userinfo {
  padding: 20px 0;
  overflow-x: hidden;
  overflow-y: auto;

  #{$c}__block {
    &--information {
      margin-block-start: 22px;
    }

    &--security,
    &--actions {
      margin-block-start: 18px;
    }

    #{$c}__block-header,
    #{$c}__block-item {
      padding-inline: $userinfo-item-padding-sides;
    }
  }
}
</style>
