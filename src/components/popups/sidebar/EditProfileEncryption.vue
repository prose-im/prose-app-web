<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-edit-profile-encryption
  settings-editor-form-fieldset(
    :fieldsets="fieldsets"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef, PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import {
  default as SettingsEditorFormFieldset,
  Fieldset as FormFieldset
} from "@/components/popups/sidebar/SettingsEditorFormFieldset.vue";
import EditProfileEncryptionDeviceCurrent from "@/components/popups/sidebar/EditProfileEncryptionDeviceCurrent.vue";
import EditProfileEncryptionDeviceOther from "@/components/popups/sidebar/EditProfileEncryptionDeviceOther.vue";

export default {
  name: "EditProfileEncryption",

  components: { SettingsEditorFormFieldset },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    dataTableClass: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "device-current",
          title: "Current device",

          parts: [
            {
              id: "identity",
              component: shallowRef(EditProfileEncryptionDeviceCurrent)
            }
          ],

          notes: [
            "Your security key fingerprint is shown as a short hash, which you can use to compare with the one your contacts see on their end. Both must match.",
            "You may roll it anytime. This will not make your message history unreadable."
          ]
        },

        {
          id: "device-other",
          title: "Other devices",

          parts: [
            {
              id: "identities",
              component: shallowRef(EditProfileEncryptionDeviceOther),

              properties: {
                dataTableClass: this.dataTableClass
              }
            }
          ],

          notes: [
            "Removing a device will not sign out from account. It prevents all messages sent to you from being decrypted by this device, until you reconnect with this device."
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
