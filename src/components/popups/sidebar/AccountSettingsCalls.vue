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
  class="p-account-settings-calls"
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
  FieldsetFieldDataButton as FormFieldsetFieldDataButton,
  FieldsetFieldDataSelect as FormFieldsetFieldDataSelect,
  FieldsetFieldDataLevel as FormFieldsetFieldDataLevel,
  FieldsetFieldDataStream as FormFieldsetFieldDataStream
} from "@/components/form/FormSettingsEditor.vue";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "AccountSettingsCalls",

  components: { FormSettingsEditor },

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
              type: FormFieldsetFieldType.Stream,
              label: "Camera tester:",

              data: {
                value: {
                  inner: "" // TODO: from stream
                }
              } as FormFieldsetFieldDataStream
            },

            {
              id: "video-input-source",
              type: FormFieldsetFieldType.Select,
              label: "Video input:",

              data: {
                value: {
                  inner: Store.$settings.calls.camera.inputSource,
                  change: Store.$settings.setCallsCameraInputSource
                },

                placeholder: "Pick a video input…",

                options: [
                  {
                    value: "system",
                    label: "Same as System"
                  }
                ],

                position: "bottom",
                disabled: true
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
              type: FormFieldsetFieldType.Level,
              label: "Mic. tester:",

              data: {
                value: {
                  inner: 0 // TODO: from input
                }
              } as FormFieldsetFieldDataLevel
            },

            {
              id: "audio-input-source",
              type: FormFieldsetFieldType.Select,
              label: "Audio input:",

              data: {
                value: {
                  inner: Store.$settings.calls.microphone.inputSource,
                  change: Store.$settings.setCallsMicrophoneInputSource
                },

                placeholder: "Pick an audio input…",

                options: [
                  {
                    value: "system",
                    label: "Same as System"
                  }
                ],

                disabled: true
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
                text: "Play Test Sound",
                disabled: true
              } as FormFieldsetFieldDataButton
            },

            {
              id: "audio-output-source",
              type: FormFieldsetFieldType.Select,
              label: "Audio output:",

              data: {
                value: {
                  inner: Store.$settings.calls.sound.outputSource,
                  change: Store.$settings.setCallSoundOutputSource
                },

                placeholder: "Pick an audio output…",

                options: [
                  {
                    value: "system",
                    label: "Same as System"
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
