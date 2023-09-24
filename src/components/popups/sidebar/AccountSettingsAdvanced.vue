<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-account-settings-advanced
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
  name: "AccountSettingsAdvanced",

  components: { SettingsEditorFormFieldset },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "updates",
          title: "Updates",

          fields: [
            {
              id: "channel",
              type: FormFieldsetFieldType.Select,
              label: "Channel:",

              data: {
                value: {
                  inner: "stable" // TODO: from model
                },

                placeholder: "Pick an update channel…",

                options: [
                  {
                    value: "stable",
                    label: "Stable (recommended)"
                  },

                  {
                    value: "beta",
                    label: "Beta (more updates, unstable)"
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            }
          ]
        },

        {
          id: "privacy",
          title: "Privacy",

          fields: [
            {
              id: "analytics",
              type: FormFieldsetFieldType.Checkbox,
              label: "Reports:",

              data: {
                value: {
                  inner: false
                },

                label: "Send anonymous usage analytics"
              } as FieldsetFieldDataCheckbox
            },

            {
              id: "crashes",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: true
                },

                label: "Automatically send crash reports"
              } as FieldsetFieldDataCheckbox
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>