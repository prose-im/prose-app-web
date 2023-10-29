<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-sidebar-details(
  class="a-inbox-details-user"
)
  template(
    v-slot:header
  )
    inbox-details-user-identity(
      :jid="jid"
      class="a-inbox-details-user__identity"
    )

  template(
    v-slot:items
  )
    inbox-details-user-information(
      v-if="profile.information"
      :jid="jid"
      :header-class="headerClass"
      :item-class="itemClass"
      :expanded="layout.inbox.details.sections.information"
    )

    inbox-details-user-security(
      v-if="profile.security"
      :jid="jid"
      :header-class="headerClass"
      :item-class="itemClass"
      :expanded="layout.inbox.details.sections.security"
    )

    inbox-details-generic-actions(
      :room="room"
      :actions="actions"
      :header-class="headerClass"
      :item-class="itemClass"
      :expanded="layout.inbox.details.sections.actions"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID, Room } from "@prose-im/prose-sdk-js";

// PROJECT: COMPOSABLES
import { useEvents } from "@/composables/events";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: COMPONENTS
import InboxDetailsUserIdentity from "@/components/inbox/InboxDetailsUserIdentity.vue";
import InboxDetailsUserInformation from "@/components/inbox/InboxDetailsUserInformation.vue";
import InboxDetailsUserSecurity from "@/components/inbox/InboxDetailsUserSecurity.vue";
import {
  default as InboxDetailsGenericActions,
  Action as DetailsAction
} from "@/components/inbox/InboxDetailsGenericActions.vue";

export default {
  name: "InboxDetailsUser",

  components: {
    InboxDetailsUserIdentity,
    InboxDetailsUserInformation,
    InboxDetailsUserSecurity,
    InboxDetailsGenericActions
  },

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    headerClass: {
      type: String,
      default: null
    },

    itemClass: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      // --> STATE <--

      isVCardSyncStale: true
    };
  },

  computed: {
    actions(): Array<DetailsAction> {
      return [
        {
          id: "files",
          title: "View shared files",
          navigate: true
        },

        {
          id: "encryption",
          title: "Encryption settings",
          navigate: true
        },

        {
          id: "remove",
          title: "Remove from contacts"
        },

        {
          id: "block",
          title: "Block contact"
        }
      ];
    },

    layout(): typeof Store.$layout {
      return Store.$layout;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
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
    // Bind session event handlers
    useEvents(Store.$session, {
      connected: this.onStoreConnected
    });

    // Synchronize vCard eagerly
    this.syncVCardEager();
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
        await Store.$profile.load(this.jid);
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
$c: ".a-inbox-details-user";

.a-inbox-details-user {
  /* TODO */
}
</style>
