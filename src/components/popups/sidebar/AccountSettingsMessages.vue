<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
form-settings-editor(
  :fieldsets="fieldsets"
  class="p-account-settings-messages"
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
  FieldsetFieldDataSelect as FormFieldsetFieldDataSelect,
  FieldsetFieldDataCheckbox as FormFieldsetFieldDataCheckbox
} from "@/components/form/FormSettingsEditor.vue";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "AccountSettingsMessages",

  components: { FormSettingsEditor },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "chats",
          title: "Chats",

          fields: [
            {
              id: "chatstates",
              type: FormFieldsetFieldType.Checkbox,
              label: "Composing:",

              data: {
                value: {
                  inner: Store.$settings.messages.chats.chatstates,
                  change: Store.$settings.setMessagesChatsChatstates
                },

                label: "Let users know when I am typing"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "spellcheck",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: Store.$settings.messages.chats.spellcheck,
                  change: Store.$settings.setMessagesChatsSpellcheck
                },

                label: "Enable spell checker"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "spacer",
              type: FormFieldsetFieldType.Spacer
            },

            {
              id: "clock-24h",
              type: FormFieldsetFieldType.Checkbox,
              label: "Messages:",

              data: {
                value: {
                  inner: Store.$settings.messages.chats.clock24h,
                  change: Store.$settings.setMessagesChatsClock24H
                },

                label: "Use a 24-hour clock"
              } as FormFieldsetFieldDataCheckbox
            }
          ]
        },

        {
          id: "files",
          title: "Files",

          fields: [
            {
              id: "uploads-optimize",
              type: FormFieldsetFieldType.Checkbox,
              label: "Uploads:",

              data: {
                value: {
                  inner: Store.$settings.messages.files.uploads.optimize,
                  change: Store.$settings.setMessagesFilesUploadsOptimize
                },

                label: "Optimize uploaded files"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "spacer",
              type: FormFieldsetFieldType.Spacer
            },

            {
              id: "image-previews-enabled",
              type: FormFieldsetFieldType.Checkbox,
              label: "Thumbnails:",

              data: {
                value: {
                  inner: Store.$settings.messages.files.imagePreviews.enabled,
                  change: Store.$settings.setMessagesFilesImagePreviewsEnabled
                },

                label: "Show a preview of image files"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "image-previews-size",
              type: FormFieldsetFieldType.Select,

              data: {
                value: {
                  inner: Store.$settings.messages.files.imagePreviews.size,
                  change: Store.$settings.setMessagesFilesImagePreviewsSize
                },

                placeholder: "Pick a size…",

                options: [
                  {
                    value: "large",
                    label: "Large size"
                  },

                  {
                    value: "small",
                    label: "Small size"
                  }
                ]
              } as FormFieldsetFieldDataSelect
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
