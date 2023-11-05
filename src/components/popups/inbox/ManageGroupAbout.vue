<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-manage-group-about
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
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataTextarea as FormFieldsetFieldDataTextarea
} from "@/components/popups/sidebar/SettingsEditorFormFieldset.vue";

export default {
  name: "ManageGroupAbout",

  components: { SettingsEditorFormFieldset },

  props: {
    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    }
  },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          // TODO: fill this up
          id: "information",
          title: "Information",

          fields: [
            {
              id: "topic",
              type: FormFieldsetFieldType.Input,
              label: "Topic:",

              data: {
                value: {
                  inner: ""
                }, // TODO: bind form model

                placeholder: "Enter a short topic…"
              } as FormFieldsetFieldDataInput
            },

            {
              id: "description",
              type: FormFieldsetFieldType.Textarea,
              label: "Description:",

              data: {
                value: {
                  inner: ""
                }, // TODO: bind form model

                type: "textarea",
                placeholder: "Enter a long description…"
              } as FormFieldsetFieldDataTextarea
            }
          ],

          notes: [
            `Fill those information about the ${this.type}, to let everyone know what it is about. ` +
              (this.type === "channel"
                ? `Those details are public to everyone.`
                : `Those details are only visible to members.`)
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
