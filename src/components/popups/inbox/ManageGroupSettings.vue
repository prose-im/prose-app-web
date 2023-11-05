<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-manage-group-settings
  settings-editor-form-fieldset(
    :fieldsets="fieldsets"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import upperFirst from "lodash.upperfirst";

// PROJECT: COMPONENTS
import {
  default as SettingsEditorFormFieldset,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataButton as FormFieldsetFieldDataButton
} from "@/components/popups/sidebar/SettingsEditorFormFieldset.vue";

export default {
  name: "ManageGroupSettings",

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

      fieldsets: []
    };
  },

  beforeMount() {
    // Generate fieldsets (they are conditional)
    this.fieldsets = this.makeFieldsets();
  },

  methods: {
    // --> HELPERS <--

    makeFieldsets(): Array<FormFieldset> {
      const fieldsets = [];

      // Append identity
      fieldsets.push({
        id: "identity",
        title: "Identity",

        fields: [
          {
            id: "name",
            type: FormFieldsetFieldType.Input,
            label: `${upperFirst(this.type)} name:`,

            data: {
              value: {
                inner: ""
              }, // TODO: bind form model

              placeholder: `Enter ${this.type} name…`
            } as FormFieldsetFieldDataInput
          }
        ],

        notes: [
          `The ${this.type} name is what users see in the app sidebar. It must be unique across your team.`
        ]
      });

      // Append maintenance fields? (only for public channels)
      if (this.type === "channel") {
        fieldsets.push({
          id: "maintenance",
          title: "Housekeeping",

          fields: [
            {
              id: "convert",
              type: FormFieldsetFieldType.Button,
              label: "Convert:",

              data: {
                text: "Convert to private group",
                disabled: true
              } as FormFieldsetFieldDataButton
            },

            {
              id: "archive",
              type: FormFieldsetFieldType.Button,
              label: `Archive ${this.type}:`,

              data: {
                text: `Archive ${this.type}`,
                disabled: true
              } as FormFieldsetFieldDataButton
            }
          ],

          notes: [
            `Archive this ${this.type} if you want to keep all its history and make it read-only. You can still restore it to its normal state later.`
          ]
        });
      }

      // Append Danger Zone
      fieldsets.push({
        id: "danger-zone",
        title: "Danger Zone",

        fields: [
          {
            id: "delete",
            type: FormFieldsetFieldType.Button,
            label: `Destroy ${this.type}:`,

            data: {
              text: `Remove ${this.type} and all messages`,
              tint: "red",
              reverse: true,
              disabled: true
            } as FormFieldsetFieldDataButton
          }
        ],

        notes: [
          `Deleting this ${this.type} will kick all members and delete all messages and files. This is a destructive operation with no coming back!`
        ]
      });

      return fieldsets;
    }
  }
};
</script>
