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
  class="p-account-settings-advanced"
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
  name: "AccountSettingsAdvanced",

  components: { FormSettingsEditor },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "updates",
          title: "Updates",

          fields: [
            {
              // TODO: implement functionality using this option
              id: "channel",
              type: FormFieldsetFieldType.Select,
              label: "Channel:",

              data: {
                value: {
                  inner: Store.$settings.updates.channel,
                  change: Store.$settings.setUpdatesChannel
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
              // TODO: implement functionality using this option
              id: "report-analytics",
              type: FormFieldsetFieldType.Checkbox,
              label: "Reports:",

              data: {
                value: {
                  inner: Store.$settings.privacy.report.analytics,
                  change: Store.$settings.setPrivacyReportAnalytics
                },

                label: "Send anonymous usage analytics"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              // TODO: implement functionality using this option
              id: "report-crashes",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: Store.$settings.privacy.report.crashes,
                  change: Store.$settings.setPrivacyReportCrashes
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
