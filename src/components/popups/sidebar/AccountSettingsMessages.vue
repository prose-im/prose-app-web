<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-account-settings-messages
  settings-editor-form-fieldset(
    :fieldsets="fieldsets"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import {
  default as SettingsEditorFormFieldset,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataSelect as FormFieldsetFieldDataSelect,
  FieldsetFieldDataCheckbox as FormFieldsetFieldDataCheckbox
} from "@/components/popups/sidebar/SettingsEditorFormFieldset.vue";

export default {
  name: "AccountSettingsMessages",

  components: { SettingsEditorFormFieldset },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "messages",
          title: "Messages",

          fields: [
            {
              id: "chatstates",
              type: FormFieldsetFieldType.Checkbox,
              label: "Composing:",

              data: {
                value: {
                  inner: true
                },

                label: "Let users know when I am typing"
              } as FieldsetFieldDataCheckbox
            },

            {
              id: "spellcheck",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: false
                },

                label: "Enable spell checker"
              } as FieldsetFieldDataCheckbox
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
                  inner: false
                },

                label: "Use a 24-hour clock"
              } as FieldsetFieldDataCheckbox
            },

            {
              id: "image-previews-enabled",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: true
                },

                label: "Show a preview of image files"
              } as FieldsetFieldDataCheckbox
            }
          ]
        },

        {
          id: "files",
          title: "Files",

          fields: [
            {
              id: "image-previews-size",
              type: FormFieldsetFieldType.Select,
              label: "Thumbnails:",

              data: {
                value: {
                  inner: "large" // TODO: from model
                },

                placeholder: "Pick a size…",

                options: [
                  {
                    value: "large",
                    label: "Large"
                  },

                  {
                    value: "small",
                    label: "Small"
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
