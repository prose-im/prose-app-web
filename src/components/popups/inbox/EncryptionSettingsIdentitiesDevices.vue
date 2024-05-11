<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
ul.p-encryption-settings-identities-devices
  li(
    v-for="device in devices"
    :key="'device_' + device.fingerprint"
    :class=`[
      "p-encryption-settings-identities-devices__device",
      {
        "p-encryption-settings-identities-devices__device--trusted": device.trusted
      }
    ]`
  )
    .p-encryption-settings-identities-devices__device-details
      span.p-encryption-settings-identities-devices__device-identity
        base-icon(
          :name="device.trusted ? 'checkmark.seal.fill' : 'xmark.seal.fill'"
          size="16px"
          class="p-encryption-settings-identities-devices__device-icon"
        )

        span.p-encryption-settings-identities-devices__device-name.u-medium
          | {{ device.name }}

        span.p-encryption-settings-identities-devices__device-last
          | Last seen 1h ago

      span.p-encryption-settings-identities-devices__device-emojis.u-select
        | {{ device.emoji }}

      span.p-encryption-settings-identities-devices__device-fingerprint.u-code.u-select
        | {{ device.fingerprint }}

    .p-encryption-settings-identities-devices__device-options
      form-fieldset-field(
        label="Trust?"
        auto-label-size
      )
        form-toggle(
          v-model="device.trusted"
        )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "EncryptionSettingsIdentitiesDevices",

  data() {
    return {
      // --> DATA <--

      devices: [
        {
          name: "MacBook Valerian",
          emoji: "1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣",

          fingerprint: [
            "45a37f26",
            "5d7da857",
            "07848791",
            "6e1e10e6",
            "23debc0e",
            "8d173327",
            "2e4185a3",
            "d3d6bd3a"
          ].join(" "),

          trusted: true
        },

        {
          name: "iPhone Valerian",
          emoji: "1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣",

          fingerprint: [
            "15a37f26",
            "5d7da857",
            "07848791",
            "3e1e10e6",
            "23debc0e",
            "8d173327",
            "1e4185a3",
            "d3d6bd3a"
          ].join(" "),

          trusted: false
        }
      ]
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-encryption-settings-identities-devices";

#{$c} {
  #{$c}__device {
    background-color: rgb(var(--color-background-primary));
    border: 1px solid rgb(var(--color-border-primary));
    margin-block-end: 10px;
    padding: 11px 18px;
    display: flex;
    align-items: center;
    border-radius: 5px;

    &:last-child {
      #{$c}__device {
        margin-block-end: 0;
      }
    }

    #{$c}__device-options {
      margin-inline-start: 12px;
    }

    #{$c}__device-identity,
    #{$c}__device-emojis,
    #{$c}__device-fingerprint {
      display: block;
    }

    #{$c}__device-identity,
    #{$c}__device-emojis {
      margin-block-end: 12px;
    }

    #{$c}__device-emojis,
    #{$c}__device-fingerprint {
      cursor: text;
    }

    #{$c}__device-identity {
      display: flex;
      align-items: center;

      #{$c}__device-icon {
        fill: rgb(var(--color-base-grey-normal));
        margin-inline-end: 6px;
        opacity: 0.65;
      }

      #{$c}__device-name {
        color: rgb(var(--color-text-primary));
        font-size: 13.5px;
      }

      #{$c}__device-last {
        color: rgb(var(--color-text-tertiary));
        font-size: 12.5px;
        margin-inline-start: 10px;
      }
    }

    #{$c}__device-emojis {
      font-size: 25px;
      letter-spacing: 8px;
    }

    #{$c}__device-fingerprint {
      color: rgb(var(--color-text-secondary));
      font-size: 11.5px;
      line-height: 15px;
    }

    &--trusted {
      border-color: rgb(var(--color-base-green-normal));
      outline: 2.5px solid rgba(var(--color-base-green-normal), 0.15);

      #{$c}__device-identity {
        #{$c}__device-icon {
          fill: rgb(var(--color-base-green-normal));
          opacity: 1;
        }
      }
    }
  }
}
</style>
