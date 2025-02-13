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

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  RuntimeConnectionMethod
} from "@/utilities/runtime";

// CONSTANTS
const RUNTIME_CONNECTION_METHODS = UtilitiesRuntime.acquireConnectionMethods();

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
              // TODO: this option is unused for now, but will be at some point
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
              // TODO: this option is unused for now, but will be at some point
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
        },

        {
          id: "network",
          title: "Network",

          fields: [
            {
              id: "connection",
              type: FormFieldsetFieldType.Select,
              label: "Connection:",

              data: {
                value: {
                  inner: Store.$settings.network.connection,
                  change: Store.$settings.setNetworkConnection
                },

                placeholder: "Pick a connection method…",

                options: [
                  {
                    value: "auto",
                    label: "Automatic (recommended)"
                  },

                  {
                    value: "native",

                    label:
                      "Native XMPP " +
                      (RUNTIME_CONNECTION_METHODS.includes(
                        RuntimeConnectionMethod.Native
                      ) !== true
                        ? "(unavailable)"
                        : "(more reliable)"),

                    disabled:
                      RUNTIME_CONNECTION_METHODS.includes(
                        RuntimeConnectionMethod.Native
                      ) !== true
                  },

                  {
                    value: "relayed",

                    label:
                      "WebSocket " +
                      (RUNTIME_CONNECTION_METHODS.includes(
                        RuntimeConnectionMethod.Relayed
                      ) !== true
                        ? "(unavailable)"
                        : "(works on more networks)"),

                    disabled:
                      RUNTIME_CONNECTION_METHODS.includes(
                        RuntimeConnectionMethod.Relayed
                      ) !== true
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
