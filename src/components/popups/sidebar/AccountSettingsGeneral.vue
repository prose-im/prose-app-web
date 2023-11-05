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
  class="p-account-settings-general"
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
  name: "AccountSettingsGeneral",

  components: { FormSettingsEditor },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "appearance",
          title: "Appearance",

          fields: [
            {
              id: "theme",
              type: FormFieldsetFieldType.Select,
              label: "Theme:",

              data: {
                value: {
                  inner: Store.$settings.appearance.theme,
                  change: Store.$settings.setAppearanceTheme
                },

                placeholder: "Pick a theme…",

                options: [
                  {
                    value: "system",
                    label: "Match system"
                  },

                  {
                    value: "light",
                    label: "Light mode"
                  },

                  {
                    value: "dark",
                    label: "Dark mode"
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            }
          ]
        },

        {
          id: "availability",
          title: "Availability",

          fields: [
            {
              id: "auto-away-enabled",
              type: FormFieldsetFieldType.Checkbox,
              label: "When idle:",

              data: {
                value: {
                  inner: Store.$settings.availability.autoAway.enabled,
                  change: Store.$settings.setAvailabilityAutoAwayEnabled
                },

                label: "Automatically mark me as away after:",
                disabled: true
              } as FormFieldsetFieldDataCheckbox
            },

            {
              id: "auto-away-after",
              type: FormFieldsetFieldType.Select,

              data: {
                value: {
                  inner: Store.$settings.availability.autoAway.after,
                  change: Store.$settings.setAvailabilityAutoAwayAfter
                },

                placeholder: "Pick an away delay…",

                options: [
                  {
                    value: "1m",
                    label: "1 minute"
                  },

                  {
                    value: "5m",
                    label: "5 minutes"
                  },

                  {
                    value: "15m",
                    label: "15 minutes"
                  },

                  {
                    value: "30m",
                    label: "30 minutes"
                  },

                  {
                    value: "1h",
                    label: "1 hour"
                  }
                ],

                disabled: true
              } as FormFieldsetFieldDataSelect
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
