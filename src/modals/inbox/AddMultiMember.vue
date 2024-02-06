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
  confirm-label="Add Member"
  class="m-add-multi-member"
  size="large"
)
  p.u-medium
    | Add a new member

  form-field(
    v-model="jid"
    @submit="onConfirm"
    :suggestions="suggestions"
    placeholder="Enter member address…"
    name="address"
    type="text"
    size="large"
    align="left"
    submittable
    autofocus
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: COMPOSABLES
import { useRosterSuggestor } from "@/composables/roster";

export default {
  name: "AddMultiMember",

  props: {
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
      suggestions
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onConfirm(): void {
      const jidUnsafeString = this.jid || null;

      if (jidUnsafeString === null) {
        BaseAlert.warning("Address required", "Please enter an address");
      } else {
        try {
          // Attempt to parse JID (this might fail, in which case the JID \
          //   needs to be considered invalid)
          const jid = new JID(jidUnsafeString.trim());

          // Add member address
          this.$emit("add", jid);
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
