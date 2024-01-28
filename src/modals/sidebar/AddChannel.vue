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
      @submit="onConfirm"
      :suggestions="suggestions"
      placeholder="Enter channel name (or address)…"
      type="email"
      name="address"
      size="large"
      align="left"
      autocomplete="off"
      submittable
      autofocus
    )

  .m-add-channel__options
    form-fieldset-field(
      label="Create a private channel"
      auto-size
    )
      form-toggle(
        v-model="private"
        name="private"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: COMPOSABLES
import { useChannelSuggestor } from "@/composables/channel";

// INTERFACES
export interface EventAddOptions {
  private: boolean;
}

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

      private: false
    };
  },

  computed: {
    confirmLabel(): string {
      return this.private === true ? "Create Private Channel" : "Add Channel";
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onConfirm(): void {
      const jidUnsafeString = this.jid || null;

      if (jidUnsafeString === null) {
        BaseAlert.warning(
          "Channel name required",
          "Please enter a name or address"
        );
      } else {
        this.$emit("add", jidUnsafeString, {
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
  }

  #{$c}__options {
    margin-block-start: 14px;
  }
}
</style>
