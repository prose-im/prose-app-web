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
  class="p-manage-multi-about"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { Room, RoomMUC } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldAsideType as FormFieldsetFieldAsideType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetOptionAside as FormFieldsetOptionAside
} from "@/components/form/FormSettingsEditor.vue";

// PROJECT: POPUPS
import { FormAbout as MultiFormAbout } from "@/popups/inbox/ManageMulti.vue";

export default {
  name: "ManageMultiAbout",

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
      type: Object as PropType<MultiFormAbout>,
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
      return [
        {
          id: "information",
          title: "Information",

          fields: [
            {
              id: "topic",
              type: FormFieldsetFieldType.Input,
              label: "Topic:",

              data: {
                value: this.form.topic,
                initial: this.form.topic.inner,
                placeholder: "Enter a short topic…"
              } as FormFieldsetFieldDataInput,

              aside: {
                type: FormFieldsetFieldAsideType.Link,
                label: "Apply",

                click: async () => {
                  try {
                    const topic = this.form.topic.inner || null;

                    if (topic === null) {
                      throw new Error("No topic");
                    }

                    // Re-assign fieldsets (with new initial value)
                    this.assignFieldsets();

                    // Set room topic
                    await (this.room as RoomMUC).setTopic(topic);

                    // Show success alert
                    BaseAlert.success(
                      "Topic set",
                      `The ${this.type} topic has been changed`
                    );
                  } catch (error) {
                    this.$log.error("Failed setting topic", error);

                    // Show error alert
                    BaseAlert.error(
                      "Cannot set topic",
                      `The ${this.type} topic could not be changed`
                    );
                  }
                }
              }
            }
          ],

          notes: [
            `Fill those information about the ${this.type}, to let everyone know what it is about. ` +
              (this.type === "channel"
                ? `Those details are public to everyone.`
                : `Those details are only visible to members.`)
          ],

          options: {
            aside: FormFieldsetOptionAside.Auto
          }
        }
      ];
    }
  }
};
</script>
