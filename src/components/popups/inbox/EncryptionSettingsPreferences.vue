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
  class="p-encryption-settings-preferences"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataToggle as FormFieldsetFieldDataToggle
} from "@/components/form/FormSettingsEditor.vue";

export default {
  name: "EncryptionSettingsPreferences",

  components: { FormSettingsEditor },

  data() {
    return {
      fieldsets: [
        {
          id: "local",
          title: "End-to-end encryption (on what I send)",

          fields: [
            {
              id: "messages",
              type: FormFieldsetFieldType.Toggle,
              label: "Sent messages:",

              data: {
                value: {
                  inner: true // TODO: save somewhere
                },

                disabled: true
              } as FormFieldsetFieldDataToggle
            },

            {
              id: "files",
              type: FormFieldsetFieldType.Toggle,
              label: "Shared files:",

              data: {
                value: {
                  inner: true // TODO: save somewhere
                },

                disabled: true
              } as FormFieldsetFieldDataToggle
            },

            {
              id: "calls",
              type: FormFieldsetFieldType.Toggle,
              label: "Video calls:",

              data: {
                value: {
                  inner: true // TODO: save somewhere
                },

                disabled: true
              } as FormFieldsetFieldDataToggle
            }
          ],

          notes: [
            "End-to-end encryption is enabled by default on all private communications with all users. It is heavily recommended to leave all options enabled.",
            "Using end-to-end encryption guarantees that no one other than you and the intended recipient can access the content you send (eg. messages, files and calls). Not even the server administrator.",
            "If you are experiencing issues sending content to the other user, you can disable some or all encryption. Doing so will not disable encryption between this app and your server."
          ]
        },

        {
          id: "remote",
          title: "End-to-end encryption (on what I receive)",

          fields: [
            {
              id: "request",
              type: FormFieldsetFieldType.Toggle,
              label: "Please encrypt:",

              data: {
                value: {
                  inner: true // TODO: save somewhere
                },

                disabled: true
              } as FormFieldsetFieldDataToggle
            }
          ],

          notes: [
            "You can ask the other party not to encrypt content they send to you, even if they support end-to-end encryption. Leave this enabled, unless you are experiencing issues eg. receiving messages."
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
