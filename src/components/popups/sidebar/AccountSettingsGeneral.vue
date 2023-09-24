<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-account-settings-general
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
  FieldsetFieldDataSelect as FormFieldsetFieldDataSelect
} from "@/components/popups/sidebar/SettingsEditorFormFieldset.vue";

export default {
  name: "AccountSettingsGeneral",

  components: { SettingsEditorFormFieldset },

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
                  inner: "system" // TODO: from model
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
                  inner: false
                },

                label: "Automatically mark me as away after:"
              } as FieldsetFieldDataCheckbox
            },

            {
              id: "auto-away-after",
              type: FormFieldsetFieldType.Select,

              data: {
                value: {
                  inner: "5m" // TODO: from model
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
