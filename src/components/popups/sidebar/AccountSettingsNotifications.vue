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
  class="p-account-settings-notifications"
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
  name: "AccountSettingsNotifications",

  components: { FormSettingsEditor },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "configuration",
          title: "Configuration",

          fields: [
            {
              // TODO: implement functionality using this option
              id: "topics",
              type: FormFieldsetFieldType.Select,
              label: "Notify me about:",

              data: {
                value: {
                  inner: Store.$settings.notifications.configuration.topics,
                  change: Store.$settings.setNotificationsConfigurationTopics
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
              // TODO: implement functionality using this option
              id: "replies",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: Store.$settings.notifications.configuration.replies,
                  change: Store.$settings.setNotificationsConfigurationReplies
                },

                label: "Let me know when I receive a message reply"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "spacer",
              type: FormFieldsetFieldType.Spacer
            },

            {
              // TODO: implement functionality using this option
              id: "when-days",
              type: FormFieldsetFieldType.Select,
              label: "Get notified:",

              data: {
                value: {
                  inner: Store.$settings.notifications.configuration.when.days,
                  change: Store.$settings.setNotificationsConfigurationWhenDays
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
              // TODO: implement functionality using this option
              id: "when-time-from",
              type: FormFieldsetFieldType.Select,
              label: "From time:",

              data: {
                value: {
                  inner:
                    Store.$settings.notifications.configuration.when.time.from,
                  change:
                    Store.$settings.setNotificationsConfigurationWhenTimeFrom
                },

                placeholder: "Pick time…",

                options: [
                  {
                    // TODO: generate list of suggested times
                    value: "10:00",
                    label: "10:00"
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            },

            {
              // TODO: implement functionality using this option
              id: "when-time-to",
              type: FormFieldsetFieldType.Select,
              label: "To time:",

              data: {
                value: {
                  inner:
                    Store.$settings.notifications.configuration.when.time.to,
                  change:
                    Store.$settings.setNotificationsConfigurationWhenTimeTo
                },

                placeholder: "Pick time…",

                options: [
                  {
                    // TODO: generate list of suggested times
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
              // TODO: implement functionality using this option
              id: "notify-badge",
              type: FormFieldsetFieldType.Checkbox,
              label: "When notified:",

              data: {
                value: {
                  inner: Store.$settings.notifications.action.notify.badge,
                  change: Store.$settings.setNotificationsActionNotifyBadge
                },

                label: "Show an unread count badge"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "notify-sound",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: Store.$settings.notifications.action.notify.sound,
                  change: Store.$settings.setNotificationsActionNotifySound
                },

                label: "Play a sound"
              } as FormFieldsetFieldDataCheckbox
            },

            {
              // TODO: implement functionality using this option
              id: "notify-banner",
              type: FormFieldsetFieldType.Checkbox,

              data: {
                value: {
                  inner: Store.$settings.notifications.action.notify.banner,
                  change: Store.$settings.setNotificationsActionNotifyBanner
                },

                label: "Pop a banner"
              } as FormFieldsetFieldDataCheckbox
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
