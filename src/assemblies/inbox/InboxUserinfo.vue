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
    v-if="profile.information"
    :jid="jid"
    :expanded="layout.inbox.userinfo.sections.information"
    class="a-inbox-userinfo__block a-inbox-userinfo__block--information"
    header-class="a-inbox-userinfo__block-header"
    item-class="a-inbox-userinfo__block-item"
  )

  inbox-userinfo-security(
    v-if="profile.security"
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
import { JID } from "@prose-im/prose-core-client-wasm";

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

  data() {
    return {
      // --> STATE <--

      isVCardSyncStale: true
    };
  },

  computed: {
    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid.bare());
    },

    fullJIDHighestOnline(): ReturnType<
      typeof Store.$presence.getHighestOnlineJID
    > {
      return Store.$presence.getHighestOnlineJID(this.jid);
    }
  },

  watch: {
    jid: {
      immediate: true,

      handler(newValue: JID, oldValue: JID) {
        // Make sure vCard data is loaded?
        if (newValue && (!oldValue || newValue.equals(oldValue) === false)) {
          // Mark as stale
          this.isVCardSyncStale = true;

          // Synchronize vCard eagerly
          this.syncVCardEager();
        }
      }
    }
  },

  created() {
    // TODO: put this in a utility helper
    // TODO: or maybe add ability to stack pending requests once connected (w/ \
    //   a timeout if not connected in due time)

    // Bind handlers
    Store.$session.events().on("connected", this.onStoreConnected);

    // Synchronize vCard eagerly
    this.syncVCardEager();
  },

  beforeUnmount() {
    // Unbind handlers
    Store.$session.events().off("connected", this.onStoreConnected);
  },

  methods: {
    // --> HELPERS <--

    async syncVCardEager(): Promise<void> {
      // Can synchronize now? (connected)
      if (this.isVCardSyncStale === true && Store.$session.connected === true) {
        // Mark synchronization as non-stale
        this.isVCardSyncStale = false;

        // Load profile
        // TODO: refresh transient values every now and then
        await Store.$profile.load(this.fullJIDHighestOnline);
      }
    },

    // --> EVENT LISTENERS <--

    onStoreConnected(connected: boolean): void {
      if (connected === true) {
        // Synchronize vCard eagerly (if stale)
        this.syncVCardEager();
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
      padding-inline: $size-inbox-userinfo-item-padding-sides;
    }
  }
}
</style>
