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
    v-model="member.jid"
    @submit="onConfirm"
    placeholder="Enter member address…"
    type="email"
    name="address"
    size="large"
    align="left"
    class="m-add-multi-member__field"
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
  name: "AddMultiMember",

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

      member: {
        jid: ""
      }
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onConfirm(): void {
      const jidUnsafeString = this.member.jid || null;

      if (jidUnsafeString === null) {
        BaseAlert.warning("Address required", "Please enter an address");
      } else {
        try {
          // Attempt to parse JID (this might fail, in which case the JID \
          //   needs to be considered invalid)
          const jid = new JID(jidUnsafeString);

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

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-add-multi-member";

.m-add-multi-member {
  #{$c}__field {
    margin-block-start: 20px;
  }
}
</style>
