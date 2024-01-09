<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
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
  class="m-add-contact"
  size="large"
)
  template(
    v-if="isMember"
  )
    p.u-medium
      | Open a direct message

    p.u-regular
      | Add an existing chat address, or invite an email to join your team.

  template(
    v-else
  )
    p.u-medium
      | Add a channel

    p.u-regular
      | Create or join a public channel, where multiple people can talk.

  .m-add-contact__form
    base-spinner(
      v-if="fetching"
      color="#949eb1"
      size="9px"
      border-width="1.5px"
      class="m-add-contact__form-spinner"
    )

    span(
      v-else-if="isVerified"
      class="m-add-contact__form-identity u-ellipsis"
    )
      base-avatar(
        :jid="identity.jid"
        size="26px"
        shadow="none"
        class="m-add-contact__form-identity-avatar"
      )

      | {{ identity.name }}

    form-field(
      v-model="jid"
      @change="onAddressChange"
      @submit="onConfirm"
      :suggestions="suggestions"
      :placeholder="fieldAddressPlacehokder"
      class="m-add-contact__form-field"
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
      "m-add-contact__notice",
      {
        "m-add-contact__notice--verified": isVerified,
        "m-add-contact__notice--unknown": !isVerified
      }
    ]`
  )
    p.m-add-contact__notice-line
      span.m-add-contact__notice-aside
        base-icon(
          :name="noticeIcon"
          size="14px"
          class="m-add-contact__notice-icon"
        )

      span.m-add-contact__notice-label
        template(
          v-if="isVerified"
        )
          | This is already a chat address, a contact request will be sent.

        template(
          v-else
        )
          | This chat address might not exist, an email invite will be sent.

    p.m-add-contact__notice-line
      span.m-add-contact__notice-aside

      span.m-add-contact__notice-label
        | Once the user accepts your request, you will be able to chat and call.
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Suggestion as FormFieldSuggestSuggestion } from "@/components/form/FormFieldSuggest.vue";

// PROJECT: COMPOSABLES
import { useRosterSuggestor } from "@/composables/roster";

// ENUMERATIONS
export enum Mode {
  // Member mode.
  Member = "member",
  // Channel mode.
  Channel = "channel"
}

// CONSTANTS
const IDENTITY_ACQUIRE_DELAY = 500; // 1/2 second

export default {
  name: "AddContact",

  props: {
    mode: {
      type: String as PropType<Mode>,
      required: true
    },

    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "add"],

  setup() {
    const { query, suggestions } = useRosterSuggestor();

    return {
      jid: query,
      memberSuggestions: suggestions
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
    isMember(): boolean {
      return this.mode === Mode.Member;
    },

    hasIdentity(): boolean {
      return this.identity.jid !== null ? true : false;
    },

    isVerified(): boolean {
      return this.hasIdentity === true && this.identity.name ? true : false;
    },

    suggestions(): Array<FormFieldSuggestSuggestion> {
      switch (this.mode) {
        case Mode.Member: {
          return this.memberSuggestions;
        }

        default: {
          return [];
        }
      }
    },

    fieldAddressPlacehokder(): string {
      return this.isMember === true
        ? "Enter contact address…"
        : "Enter channel name…";
    },

    noticeIcon(): string {
      return this.isVerified === true
        ? "checkmark.circle.fill"
        : "questionmark.circle.fill";
    },

    confirmLabel(): string {
      return this.isMember === true ? "Open Direct Message" : "Add Channel";
    }
  },

  methods: {
    // --> HELPERS <--

    async acquireIdentity(jid: JID | null): Promise<void> {
      const localId = ++this.identity.id;

      if (jid !== null) {
        this.fetching = true;

        // Load identity
        // TODO: await profile loading method

        // Assign JID and name (after loading profile)
        // Important: only proceed if local identifier matches last current \
        //   identifier, as this load could have been slower than expected, \
        //   thus it could have been replaced by a newer load.
        if (localId === this.identity.id) {
          // TODO: assign real name there, or none if JID doesnt exist
          this.identity.jid = jid;
          this.identity.name = jid.node || "";
        }
      } else {
        this.fetching = false;

        // Reset JID and name (immediately)
        this.identity.jid = null;
        this.identity.name = "";
      }
    },

    // --> EVENT LISTENERS <--

    async onAddressChange(address: string): Promise<void> {
      if (this.identityAcquireTimeout !== null) {
        clearTimeout(this.identityAcquireTimeout);
      }

      if (address) {
        this.identityAcquireTimeout = setTimeout(async () => {
          this.identityAcquireTimeout = null;

          // Acquire parsed JID
          // Notice: this might fail if the user-provided JID is invalid or \
          //   not yet fully complete.
          let jid: JID | null;

          try {
            jid = new JID(address);
          } catch (_) {
            jid = null;
          }

          await this.acquireIdentity(jid);
        }, IDENTITY_ACQUIRE_DELAY);
      } else {
        await this.acquireIdentity(null);
      }
    },

    onConfirm(): void {
      const jidUnsafeString = this.jid || null;

      if (jidUnsafeString === null) {
        BaseAlert.warning("Address required", "Please enter an address");
      } else {
        try {
          // Attempt to parse JID (this might fail, in which case the JID \
          //   needs to be considered invalid)
          // TODO: restore this functionality
          // const jid = new JID(jidUnsafeString);

          // const name =
          //   this.identity.jid && jid.equals(this.identity.jid) === true
          //     ? this.identity.name
          //     : "";

          this.$emit("add", jidUnsafeString);
        } catch (_) {
          BaseAlert.warning(
            "Invalid address",
            "Make sure this address is valid"
          );
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-add-contact";

.m-add-contact {
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
