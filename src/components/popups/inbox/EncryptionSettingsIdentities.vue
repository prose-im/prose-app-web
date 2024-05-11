<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-encryption-settings-identities
  ul.p-encryption-settings-identities__devices
    li.p-encryption-settings-identities__device(
      v-for="device in devices"
      :key="'device_' + device.fingerprint"
    )
      .p-encryption-settings-identities__device-details
        span.p-encryption-settings-identities__device-emoji
          | {{ device.emoji }}

        span.p-encryption-settings-identities__device-fingerprint
          | {{ device.fingerprint }}

        span.p-encryption-settings-identities__device-name
          | {{ device.name }}

      .p-encryption-settings-identities__device-options
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "EncryptionSettingsIdentities",

  data() {
    return {
      // --> DATA <--

      devices: [
        {
          name: "MacBook Valerian",
          emoji: "🦹🚶‍♂️🍖🥪🧀",

          fingerprint: [
            "45a37f26",
            "5d7da857",
            "07848791",
            "6e1e10e6",
            "23debc0e",
            "8d173327",
            "2e4185a3",
            "d3d6bd3a"
          ].join(" ")
        },

        {
          name: "iPhone Valerian",
          emoji: "🦹🚶‍♂️🍖🥪🧀",

          fingerprint: [
            "15a37f26",
            "5d7da857",
            "07848791",
            "3e1e10e6",
            "23debc0e",
            "8d173327",
            "1e4185a3",
            "d3d6bd3a"
          ].join(" ")
        }
      ]
    };
  }
};
</script>
