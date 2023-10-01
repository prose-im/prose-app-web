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

// PROJECT: STORES
import Store from "@/store";

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
                  inner: Store.$settings.updates.channel
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
              id: "report-analytics",
              type: FormFieldsetFieldType.Checkbox,
              label: "Reports:",

              data: {
                value: {
                  inner: Store.$settings.privacy.report.analytics
                },

                label: "Send anonymous usage analytics"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "report-crashes",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: Store.$settings.privacy.report.crashes
                },

                label: "Automatically send crash reports"
              } as FormFieldsetFieldDataCheckbox
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
