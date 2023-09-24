<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-account-settings-calls
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
  FieldsetFieldDataButton as FormFieldsetFieldDataButton,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataSelect as FormFieldsetFieldDataSelect
} from "@/components/popups/sidebar/SettingsEditorFormFieldset.vue";

export default {
  name: "AccountSettingsCalls",

  components: { SettingsEditorFormFieldset },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "camera",
          title: "Camera",

          fields: [
            {
              id: "video-input-tester",
              type: FormFieldsetFieldType.Input,
              label: "Camera tester:",

              data: {
                // TODO: use a custom bar chart component

                value: {
                  inner: "" // TODO: from model
                },

                placeholder: "<<Camera stream URL>>"
              } as FormFieldsetFieldDataInput
            },

            {
              id: "video-input-source",
              type: FormFieldsetFieldType.Select,
              label: "Video input:",

              data: {
                value: {
                  inner: "system" // TODO: from model
                },

                placeholder: "Pick a video input…",

                options: [
                  {
                    value: "system",
                    label: "Same as System"
                  }
                ],

                position: "bottom"
              } as FormFieldsetFieldDataSelect
            }
          ]
        },

        {
          id: "microphone",
          title: "Microphone",

          fields: [
            {
              id: "audio-input-tester",
              type: FormFieldsetFieldType.Input,
              label: "Mic. tester:",

              data: {
                // TODO: use a custom bar chart component

                value: {
                  inner: "" // TODO: from model
                },

                placeholder: "<<Volume in dB>>"
              } as FormFieldsetFieldDataInput
            },

            {
              id: "audio-input-source",
              type: FormFieldsetFieldType.Select,
              label: "Audio input:",

              data: {
                value: {
                  inner: "system" // TODO: from model
                },

                placeholder: "Pick an audio input…",

                options: [
                  {
                    value: "system",
                    label: "Same as System"
                  }
                ]
              } as FormFieldsetFieldDataSelect
            }
          ]
        },

        {
          id: "sound",
          title: "Sound",

          fields: [
            {
              id: "audio-output-tester",
              type: FormFieldsetFieldType.Button,
              label: "Speaker tester:",

              data: {
                text: "Play Test Sound"
              } as FormFieldsetFieldDataButton
            },

            {
              id: "audio-output-source",
              type: FormFieldsetFieldType.Select,
              label: "Audio output:",

              data: {
                value: {
                  inner: "system" // TODO: from model
                },

                placeholder: "Pick an audio output…",

                options: [
                  {
                    value: "system",
                    label: "Same as System"
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
