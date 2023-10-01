<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-account-settings-notifications
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
  name: "AccountSettingsNotifications",

  components: { SettingsEditorFormFieldset },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "configuration",
          title: "Configuration",

          fields: [
            {
              id: "topics",
              type: FormFieldsetFieldType.Select,
              label: "Notify me about:",

              data: {
                value: {
                  inner: "all" // TODO: from model
                },

                placeholder: "Pick topics to get notified…",

                options: [
                  {
                    value: "all",
                    label: "All messages"
                  },

                  {
                    value: "mention",
                    label: "Only messages targeted to me"
                  },

                  {
                    value: "nothing",
                    label: "Nothing (not recommended)"
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            },

            {
              id: "replies",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: true
                },

                label: "Let me know when I receive a message reply"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "spacer",
              type: FormFieldsetFieldType.Spacer
            },

            {
              id: "when-days",
              type: FormFieldsetFieldType.Select,
              label: "Get notified:",

              data: {
                value: {
                  inner: "weekdays" // TODO: from model
                },

                placeholder: "Pick when to get notified…",

                options: [
                  {
                    value: "weekdays",
                    label: "Weekdays"
                  },

                  {
                    value: "everyday",
                    label: "Every day"
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            },

            {
              id: "when-time-from",
              type: FormFieldsetFieldType.Select,
              label: "From time:",

              data: {
                value: {
                  inner: "10:00" // TODO: from model
                },

                placeholder: "Pick time…",

                options: [
                  {
                    value: "10:00",
                    label: "10:00"
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            },

            {
              id: "when-time-to",
              type: FormFieldsetFieldType.Select,
              label: "To time:",

              data: {
                value: {
                  inner: "18:00" // TODO: from model
                },

                placeholder: "Pick time…",

                options: [
                  {
                    value: "18:00",
                    label: "18:00"
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            }
          ]
        },

        {
          id: "action",
          title: "How to notify",

          fields: [
            {
              id: "notify-badge",
              type: FormFieldsetFieldType.Checkbox,
              label: "When notified:",

              data: {
                value: {
                  inner: true
                },

                label: "Show a badge in the tab bar"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "notify-sound",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: false
                },

                label: "Play a sound"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "notify-banner",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: true
                },

                label: "Pop a banner"
              } as FormFieldsetFieldDataCheckbox
            }
          ]
        },

        {
          id: "devices",
          title: "Multi-device",

          fields: [
            {
              id: "mobile-alerts-enabled",
              type: FormFieldsetFieldType.Checkbox,
              label: "Mobile alerts:",

              data: {
                value: {
                  inner: true
                },

                label: "Forward to mobile if inactive after:"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "mobile-alerts-after",
              type: FormFieldsetFieldType.Select,

              data: {
                value: {
                  inner: "5m" // TODO: from model
                },

                placeholder: "Pick a delay…",

                options: [
                  {
                    value: "10s",
                    label: "10 seconds"
                  },

                  {
                    value: "1m",
                    label: "1 minute"
                  },

                  {
                    value: "2m",
                    label: "2 minutes"
                  },

                  {
                    value: "5m",
                    label: "5 minutes"
                  },

                  {
                    value: "10m",
                    label: "10 minutes"
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
