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
  confirm-label="Sign Out"
  class="m-sign-out"
  size="large"
  constrained
  destructive
)
  base-placeholder-image(
    illustration="goodbye"
    title="Do you really want to sign out?"
    description="You will need to login again to access your inbox and receive notifications."
    class="m-sign-out__placeholder"
  )

  base-separator(
    direction="horizontal"
  )

  form-fieldset-field(
    label="Also delete all cached data? (if this is not your own device)"
    auto-label-size
  )
    form-checkbox(
      v-model="form.purge"
      size="small"
      name="purge"
    )

  form-fieldset-notes(
    v-if="form.purge"
    :spaced="false"
  )
    p.u-regular
      | Deleting cached data will permanently remove your messages from this device. You may not be able to decrypt them when you log back in.

    p.m-sign-out__disclaimer.u-medium
      base-icon(
        name="info.circle.fill"
        size="12px"
        class="m-sign-out__disclaimer-icon"
      )

      | Make sure you still have another device logged in to Prose to grant access to your encrypted messages!
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// INTERFACES
export interface EventProceedOptions {
  purge: boolean;
}

export default {
  name: "SignOut",

  emits: ["close", "proceed"],

  data() {
    return {
      // --> STATES <--

      form: {
        purge: false
      }
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onConfirm(): void {
      this.$emit("proceed", {
        purge: this.form.purge
      } as EventProceedOptions);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-sign-out";

#{$c} {
  #{$c}__placeholder {
    margin-inline: auto;
    margin-block: 16px 36px;
  }

  #{$c}__disclaimer {
    color: rgb(var(--color-base-grey-dark));

    #{$c}__disclaimer-icon {
      fill: currentcolor;
      margin-block-end: -1px;
      margin-inline-end: 5px;
    }
  }
}
</style>
