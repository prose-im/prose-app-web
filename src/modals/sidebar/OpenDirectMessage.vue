<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-modal(
  @close="$emit('close')"
  @confirm="onConfirm"
  :confirm-loading="loading"
  :confirm-label="confirmLabel"
  class="m-open-direct-message"
  size="large"
)
  template(
    v-if="compose"
  )
    p.u-medium
      | Compose a new message

    p.u-regular
      | Message anyone from your team, or create a group of people.

  template(
    v-else
  )
    p.u-medium
      | Open a direct message

    p.u-regular
      | Add an existing chat address, or invite an email to join your team.

  .m-open-direct-message__form
    base-spinner(
      v-if="fetching"
      color="rgb(var(--color-base-grey-normal))"
      size="9px"
      border-width="1.5px"
      class="m-open-direct-message__form-spinner"
    )

    span(
      v-else-if="isVerified"
      class="m-open-direct-message__form-identity u-ellipsis"
    )
      base-avatar(
        :jid="identity.jid"
        size="26px"
        shadow="none"
        class="m-open-direct-message__form-identity-avatar"
      )

      | {{ identity.name }}

    form-field(
      v-model="jid"
      @change="onAddressChange"
      @submit="onConfirm"
      :suggestions="suggestions"
      placeholder="Enter contact address…"
      class="m-open-direct-message__form-field"
      type="email"
      name="address"
      size="large"
      align="left"
      autocomplete="off"
      submittable
      autofocus
    )

  div(
    v-if="hasIdentity"
    :class=`[
      "m-open-direct-message__notice",
      {
        "m-open-direct-message__notice--verified": isVerified,
        "m-open-direct-message__notice--unknown": !isVerified
      }
    ]`
  )
    p.m-open-direct-message__notice-line
      span.m-open-direct-message__notice-aside
        base-icon(
          :name="noticeIcon"
          size="14px"
          class="m-open-direct-message__notice-icon"
        )

      span.m-open-direct-message__notice-label
        template(
          v-if="isContact"
        )
          | This is a contact of yours, start messaging right away!

        template(
          v-else-if="isVerified"
        )
          | This is a chat address, a contact request will also be sent.

        template(
          v-else
        )
          | This chat address may not exist, an email invite will also be sent.

    p.m-open-direct-message__notice-line(
      v-if="!isContact"
    )
      span.m-open-direct-message__notice-aside

      span.m-open-direct-message__notice-label
        | Once the user accepts, they will be able to see your message.
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, UserProfile } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: COMPOSABLES
import { useRosterSuggestor } from "@/composables/roster";

// CONSTANTS
const IDENTITY_ACQUIRE_DELAY = 1000; // 1 second

export default {
  name: "OpenDirectMessage",

  props: {
    loading: {
      type: Boolean,
      default: false
    },

    compose: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "open"],

  setup() {
    const { query, suggestions } = useRosterSuggestor();

    return {
      jid: query,
      suggestions
    };
  },

  data() {
    return {
      // --> STATE <--

      identity: {
        id: 0,
        name: "",
        jid: null as JID | null
      },

      fetching: false,

      identityAcquireTimeout: null as null | ReturnType<typeof setTimeout>
    };
  },

  computed: {
    hasIdentity(): boolean {
      return this.identity.jid !== null ? true : false;
    },

    isVerified(): boolean {
      return this.hasIdentity === true && this.identity.name ? true : false;
    },

    isContact(): boolean {
      return (
        this.hasIdentity === true &&
        this.identity.jid !== null &&
        Store.$roster.getContactsEntry(this.identity.jid) !== undefined
      );
    },

    confirmLabel(): string {
      return this.compose === true ? "Compose Message" : "Open Direct Message";
    },

    noticeIcon(): string {
      return this.isVerified === true
        ? "checkmark.circle.fill"
        : "questionmark.circle.fill";
    }
  },

  methods: {
    // --> HELPERS <--

    async acquireIdentity(jid: JID | null): Promise<void> {
      const localId = ++this.identity.id;

      if (jid !== null) {
        this.fetching = true;

        // Request profile for JID
        let profile: UserProfile | null;

        try {
          profile = (await Broker.$profile.loadUserProfile(jid)) || null;
        } catch (error) {
          this.$log.error(
            `Could not load profile when opening direct message: '${jid}'`,
            error
          );

          profile = null;
        }

        // Assign JID and name (after loading profile)
        // Important: only proceed if local identifier matches last current \
        //   identifier, as this load could have been slower than expected, \
        //   thus it could have been replaced by a newer load.
        if (localId === this.identity.id) {
          // Assign JID
          this.identity.jid = jid;

          // Assign name (priorize first name, if available)
          this.identity.name = profile?.firstName || profile?.nickname || "";

          this.fetching = false;
        }
      } else {
        // Reset JID and name (immediately)
        this.identity.jid = null;
        this.identity.name = "";

        this.fetching = false;
      }
    },

    // --> EVENT LISTENERS <--

    async onAddressChange(address: string): Promise<void> {
      // Clear any previous acquire
      if (this.identityAcquireTimeout !== null) {
        clearTimeout(this.identityAcquireTimeout);
      }

      // Acquire identity?
      if (address) {
        this.identityAcquireTimeout = setTimeout(async () => {
          this.identityAcquireTimeout = null;

          // Acquire parsed JID
          // Notice: this might fail if the user-provided JID is invalid or \
          //   not yet fully complete.
          let jid: JID | null;

          try {
            jid = new JID(address);

            // JID is incomplete? (void it)
            if (!jid.node || !jid.domain) {
              jid = null;
            }
          } catch (_) {
            jid = null;
          }

          await this.acquireIdentity(jid);
        }, IDENTITY_ACQUIRE_DELAY);
      }
    },

    onConfirm(): void {
      const jidUnsafeString = this.jid || null;

      if (jidUnsafeString === null) {
        BaseAlert.warning("Address required", "Please enter an address");
      } else {
        this.$emit("open", jidUnsafeString.toLowerCase());
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-open-direct-message";

#{$c} {
  #{$c}__form {
    margin-block-start: 20px;
    display: flex;
    align-items: center;

    #{$c}__form-identity,
    #{$c}__form-spinner {
      margin-inline-start: 3px;
      margin-inline-end: 14px;
      flex: 0 0 auto;
    }

    #{$c}__form-identity {
      color: rgb(var(--color-text-secondary));
      max-width: 30%;
      display: flex;
      align-items: center;

      #{$c}__form-identity-avatar {
        margin-inline-end: 6px;
        flex: 0 0 auto;
      }
    }

    #{$c}__form-field {
      flex: 1;
    }
  }

  #{$c}__notice {
    margin-block-start: 16px;

    #{$c}__notice-line {
      font-size: 13.5px;
      margin-block-end: 2px;
      display: flex;
      align-items: center;

      &:last-child {
        margin-block-end: 0;
      }

      #{$c}__notice-aside {
        min-width: 14px;
        padding-inline-end: 6px;
        flex: 0 0 auto;

        #{$c}__notice-icon {
          display: block;
        }
      }

      #{$c}__notice-label {
        color: rgb(var(--color-text-secondary));
        flex: 1;
      }
    }

    &--verified {
      #{$c}__notice-line {
        &:first-child {
          #{$c}__notice-icon {
            fill: rgb(var(--color-base-green-normal));
          }

          #{$c}__notice-label {
            color: rgb(var(--color-base-green-normal));
          }
        }
      }
    }

    &--unknown {
      #{$c}__notice-line {
        &:first-child {
          #{$c}__notice-icon {
            fill: rgb(var(--color-base-grey-dark));
          }

          #{$c}__notice-label {
            color: rgb(var(--color-base-grey-dark));
          }
        }
      }
    }
  }
}
</style>
