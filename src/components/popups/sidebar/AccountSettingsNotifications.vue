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
import { Option as FormSelectOption } from "@/components/form/FormSelect.vue";
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
import UtilitiesDate from "@/utilities/date";

// CONSTANTS
const WHEN_TIME_START_FROM = "00:00";
const WHEN_TIME_END_TO = "00:00";

export default {
  name: "AccountSettingsNotifications",

  components: { FormSettingsEditor },

  computed: {
    fieldsets(): Array<FormFieldset> {
      return [
        {
          id: "configuration",
          title: "Configuration",

          fields: [
            {
              // TODO: implement functionality using this option
              // TODO: if message is from group and mode is mention then check \
              //   mentions field of CoreMessage, if should contain a user \
              //   property with our own JID.
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
              // TODO: do this w/ the replyTo.sender.jid field of CoreMessage \
              //   is set and not me and from is not me.
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
              id: "when-time-from",
              type: FormFieldsetFieldType.Select,
              label: "From time:",

              data: {
                value: {
                  inner:
                    Store.$settings.notifications.configuration.when.time.from,
                  change: this.onFieldsetConfigurationWhenTimeFromChange
                },

                placeholder: "Pick time…",

                options: [
                  ...this.listWhenTimeOptions(""),
                  ...this.listWhenTimeOptions(WHEN_TIME_START_FROM)
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
                  inner:
                    Store.$settings.notifications.configuration.when.time.to,
                  change:
                    Store.$settings.setNotificationsConfigurationWhenTimeTo
                },

                placeholder: "Pick time…",

                options: this.listWhenTimeOptions(
                  Store.$settings.notifications.configuration.when.time.from,
                  true
                ),

                position: "bottom",

                disabled: !Store.$settings.notifications.configuration.when.time
                  .from
                  ? true
                  : false
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
      ];
    }
  },

  methods: {
    // --> HELPERS <--

    listWhenTimeOptions(
      fromValue: string,
      withOffset = false
    ): Array<FormSelectOption> {
      // Generate options? (any from value set)
      if (fromValue) {
        return Array.from(
          UtilitiesDate.hoursMinutesAfter(fromValue, withOffset)
        ).map(value => {
          return {
            value: value,
            label: value
          };
        });
      }

      // Do not generate any option
      return [
        {
          value: "",
          label: "All the time"
        }
      ];
    },

    // --> EVENT LISTENERS <--

    onFieldsetConfigurationWhenTimeFromChange(value: string): void {
      Store.$settings.setNotificationsConfigurationWhenTimeFrom(value);
      Store.$settings.setNotificationsConfigurationWhenTimeTo(WHEN_TIME_END_TO);
    }
  }
};
</script>
