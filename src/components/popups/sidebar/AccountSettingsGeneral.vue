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
  FieldsetFieldDataSelect as FormFieldsetFieldDataSelect
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
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
