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
  confirm-label="Add External Contact"
  class="m-add-external-contact"
  size="large"
)
  p.u-medium
    | Add an external contact

  p.u-regular
    | You can request to connect with people from other teams. They will receive an invitation to connect, which they may approve or decline.

  form-field(
    v-model="jid"
    @submit="onConfirm"
    placeholder="Enter external contact address…"
    name="address"
    type="text"
    size="large"
    align="left"
    class="m-add-external-contact__field"
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

export default {
  name: "AddExternalContact",

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["close", "add"],

  data() {
    return {
      // --> STATE <--

      jid: ""
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

          // Add contact address
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

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-add-external-contact";

.m-add-external-contact {
  #{$c}__field {
    margin-block-start: 20px;
  }
}
</style>
