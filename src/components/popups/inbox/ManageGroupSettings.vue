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
  class="p-manage-group-settings"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import upperFirst from "lodash.upperfirst";
import { Room, RoomMutableName } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldAsideType as FormFieldsetFieldAsideType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataButton as FormFieldsetFieldDataButton,
  FieldsetOptionAside as FormFieldsetOptionAside
} from "@/components/form/FormSettingsEditor.vue";

// PROJECT: POPUPS
import { FormSettings as GroupFormSettings } from "@/popups/inbox/ManageGroup.vue";

export default {
  name: "ManageGroupSettings",

  components: { FormSettingsEditor },

  props: {
    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    room: {
      type: Object as PropType<Room>,
      required: true
    },

    form: {
      type: Object as PropType<GroupFormSettings>,
      required: true
    }
  },

  data() {
    return {
      // --> DATA <--

      fieldsets: [] as Array<FormFieldset>
    };
  },

  beforeMount() {
    // Generate fieldsets (they are conditional)
    this.assignFieldsets();
  },

  methods: {
    // --> HELPERS <--

    assignFieldsets(): void {
      this.fieldsets = this.makeFieldsets();
    },

    makeFieldsets(): Array<FormFieldset> {
      const fieldsets = [];

      // Append channel-specific fields?
      if (this.type === "channel") {
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
                value: this.form.name,
                initial: this.form.name.inner,
                placeholder: `Enter ${this.type} name…`
              } as FormFieldsetFieldDataInput,

              aside: {
                type: FormFieldsetFieldAsideType.Link,
                label: "Apply",

                click: async () => {
                  try {
                    const name = this.form.name.inner || null;

                    if (name === null) {
                      throw new Error("No name");
                    }

                    // Re-assign fieldsets (with new initial value)
                    this.assignFieldsets();

                    // Set room name
                    await (this.room as RoomMutableName).setName(name);

                    // Show success alert
                    BaseAlert.success(
                      "Name set",
                      `The ${this.type} name has been changed`
                    );
                  } catch (error) {
                    this.$log.error("Failed setting name", error);

                    // Show error alert
                    BaseAlert.error(
                      "Cannot set name",
                      `The ${this.type} name could not be changed`
                    );
                  }
                }
              }
            }
          ],

          notes: [
            `The ${this.type} name is what users see in the app sidebar. It must be unique across your team.`
          ],

          options: {
            aside: FormFieldsetOptionAside.Auto
          }
        });

        // Append maintenance fields
        fieldsets.push({
          id: "maintenance",
          title: "Housekeeping",

          fields: [
            // TODO: only if channel is currently public
            {
              id: "convert",
              type: FormFieldsetFieldType.Button,
              label: "Convert:",

              data: {
                text: "Convert to private channel",
                disabled: true
              } as FormFieldsetFieldDataButton
            },

            {
              id: "archive",
              type: FormFieldsetFieldType.Button,
              label: "Archive:",

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
            label: "Destroy:",

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
