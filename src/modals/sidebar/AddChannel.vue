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
  :confirm-disabled="fetching"
  :confirm-label="confirmLabel"
  class="m-add-channel"
  size="large"
)
  p.u-medium
    | Add a channel

  p.u-regular
    | Create or join a channel, where multiple people can talk.

  .m-add-channel__form
    form-field(
      v-model="jid"
      @change="onAddressChange"
      @submit="onConfirm"
      :suggestions="channelSuggestions"
      placeholder="Enter channel name (or address)…"
      class="m-add-channel__form-field"
      type="email"
      name="address"
      size="large"
      align="left"
      autocomplete="off"
      submittable
      autofocus
    )

    base-spinner(
      v-if="fetching"
      color="#949eb1"
      size="9px"
      border-width="1.5px"
      class="m-add-channel__form-spinner"
    )

  .m-add-channel__options
    form-fieldset-field(
      label="Create a private channel"
      auto-size
    )
      form-toggle(
        v-model="private"
        @change="onPrivateChange"
        name="private"
      )

  .m-add-channel__notice(
    v-if="hasExistence"
  )
    template(
      v-if="doesExist"
    )
      | The channel

      base-space

      span.u-medium
        | {{ existence.name }}

      base-space

      | already exists. You will join it.

    template(
      v-else
    )
      | The channel

      base-space

      span.u-medium
        | {{ existence.name }}

      base-space

      | does not exist. You will create it and then join it.
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Suggestion as FormFieldSuggestSuggestion } from "@/components/form/FormFieldSuggest.vue";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: COMPOSABLES
import { useChannelSuggestor } from "@/composables/channel";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// INTERFACES
export interface EventAddOptions {
  private: boolean;
}

// CONSTANTS
const EXISTENCE_ACQUIRE_DELAY = 500; // 1/2 second

export default {
  name: "AddChannel",

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "add"],

  setup() {
    const { query, suggestions } = useChannelSuggestor();

    return {
      jid: query,
      suggestions
    };
  },

  data() {
    return {
      // --> STATE <--

      existence: {
        id: 0,
        name: "",
        exists: false
      },

      fetching: false,

      private: false,

      existenceAcquireTimeout: null as null | ReturnType<typeof setTimeout>
    };
  },

  computed: {
    hasExistence(): boolean {
      return this.existence.name ? true : false;
    },

    doesExist(): boolean {
      return this.hasExistence === true && this.existence.exists;
    },

    channelSuggestions(): Array<FormFieldSuggestSuggestion> {
      // Do not return any suggestion if private mode
      if (this.private === true) {
        return [];
      }

      return this.suggestions;
    },

    confirmLabel(): string {
      // Private channel?
      if (this.private === true) {
        return "Create Private Channel";
      }

      // Join existing channel?
      if (this.doesExist === true) {
        return "Join Channel";
      }

      // Create new channel
      return "Create Channel";
    }
  },

  methods: {
    // --> HELPERS <--

    async acquireExistence(name = ""): Promise<void> {
      const localId = ++this.existence.id;

      if (name) {
        this.fetching = true;

        // Check if channel exists (by name)
        let roomJID: JID | null;

        try {
          roomJID =
            (await Broker.$channel.findPublicChannelByName(name)) || null;
        } catch (error) {
          logger.error(
            `Could not find public channel when adding channel: '${name}'`,
            error
          );

          roomJID = null;
        }

        // Assign name and exists status (after checking if exists)
        // Important: only proceed if local identifier matches last current \
        //   identifier, as this load could have been slower than expected, \
        //   thus it could have been replaced by a newer load.
        if (localId === this.existence.id) {
          // Assign name
          this.existence.name = name;
          this.existence.exists = roomJID !== null;

          this.fetching = false;
        }
      } else {
        // Reset name and exists status (immediately)
        this.existence.name = "";
        this.existence.exists = false;

        this.fetching = false;
      }
    },

    // --> EVENT LISTENERS <--

    async onAddressChange(address: string): Promise<void> {
      // Clear any previous acquire
      if (this.existenceAcquireTimeout !== null) {
        clearTimeout(this.existenceAcquireTimeout);
      }

      // Check if channel already exists? (only if not a JID-like value, and \
      //   if channel is public)
      if (address && address.includes("@") === false && this.private !== true) {
        // Alias address to a channel name (since it is not JID-like)
        const name = address.toLowerCase();

        this.existenceAcquireTimeout = setTimeout(async () => {
          this.existenceAcquireTimeout = null;

          await this.acquireExistence(name);
        }, EXISTENCE_ACQUIRE_DELAY);
      } else {
        await this.acquireExistence();
      }
    },

    async onPrivateChange(isPrivate: boolean): Promise<void> {
      const address = this.jid;

      // Re-acquire existence? (or reset, since it is private or there is no \
      //   address anyway)
      if (isPrivate !== true && address) {
        await this.acquireExistence(address);
      } else {
        await this.acquireExistence();
      }
    },

    onConfirm(): void {
      const jidUnsafeString = this.jid || null;

      if (jidUnsafeString === null) {
        BaseAlert.warning(
          "Channel name required",
          "Please enter a name or address"
        );
      } else {
        this.$emit("add", jidUnsafeString.toLowerCase(), {
          private: this.private
        } as EventAddOptions);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-add-channel";

.m-add-channel {
  #{$c}__form {
    margin-block-start: 20px;
    display: flex;
    align-items: center;

    #{$c}__form-field {
      flex: 1;
    }

    #{$c}__form-spinner {
      margin-inline-start: 18px;
      margin-inline-end: 1px;
      flex: 0 0 auto;
    }
  }

  #{$c}__options {
    margin-block-start: 14px;
  }

  #{$c}__notice {
    color: rgb(var(--color-text-secondary));
    font-size: 13.5px;
    margin-block-start: 16px;
  }
}
</style>
