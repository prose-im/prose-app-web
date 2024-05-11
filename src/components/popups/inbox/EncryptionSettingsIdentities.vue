<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
form-settings-editor(
  :fieldsets="fieldsets"
  class="p-encryption-settings-identities"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";

// PROJECT: COMPONENTS
import EncryptionSettingsIdentitiesDevices from "@/components/popups/inbox/EncryptionSettingsIdentitiesDevices.vue";

export default {
  name: "EncryptionSettingsIdentities",

  components: { EncryptionSettingsIdentitiesDevices },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "identities",
          title: "User identities (devices used to send messages)",

          parts: [
            {
              id: "devices",
              component: shallowRef(EncryptionSettingsIdentitiesDevices)
            }
          ],

          notes: [
            "Each device that this user uses carries an identity that is unique. Those identities are published publicly so that Prose can encrypt the messages that you send, in a way that only the user recipient devices can decrypt the messages.",
            "Make sure to verify with the user that each user device security emojis match, and mark the ones you verified as such.",
            "If you do not recognize a device, mark it as untrusted so that messages cannot be decrypted by such devices."
          ]
        }
      ]
    };
  }
};
</script>
