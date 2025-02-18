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
  class="p-manage-multi-settings"
)
  template(
    v-slot:modals
  )
    delete-multi(
      v-if="modals.deleteMulti.visible"
      @proceed="onModalDeleteMultiProceed"
      @close="onModalDeleteMultiClose"
      :type="type"
      :loading="modals.deleteMulti.loading"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import upperFirst from "lodash.upperfirst";
import { JID, Room, RoomMutableName } from "@prose-im/prose-sdk-js";

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

// PROJECT: MODALS
import DeleteMulti from "@/modals/inbox/DeleteMulti.vue";

// PROJECT: POPUPS
import { FormSettings as MultiFormSettings } from "@/popups/inbox/ManageMulti.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

export default {
  name: "ManageMultiSettings",

  components: { FormSettingsEditor, DeleteMulti },

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
      type: Object as PropType<MultiFormSettings>,
      required: true
    }
  },

  data() {
    return {
      // --> STATE <--

      modals: {
        deleteMulti: {
          visible: false,
          loading: false
        }
      },

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
                click: this.onFieldsetIdentityNameApplyClick
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
              click: this.onFieldsetDangerZoneDeleteClick
            } as FormFieldsetFieldDataButton
          }
        ],

        notes: [
          `Deleting this ${this.type} will kick all members and delete all messages and files. This is a destructive operation with no coming back!`
        ]
      });

      return fieldsets;
    },

    // --> EVENT LISTENERS <--

    async onFieldsetIdentityNameApplyClick(): Promise<void> {
      try {
        const name = this.form.name.inner || null;

        if (name === null) {
          throw new Error("No name");
        }

        // Re-assign fieldsets (with new initial value)
        this.assignFieldsets();

        // Set room name
        await (this.room as RoomMutableName).setName(name);

        // Force reload all channels
        if (this.type === "channel") {
          Store.$channel.markChannelsChanged();
        }

        // Show success alert
        BaseAlert.success("Name set", `The ${this.type} name has been changed`);
      } catch (error) {
        this.$log.error("Failed setting name", error);

        // Show error alert
        BaseAlert.error(
          "Cannot set name",
          `The ${this.type} name could not be changed`
        );
      }
    },

    async onFieldsetDangerZoneDeleteClick(): Promise<void> {
      this.modals.deleteMulti.visible = true;
    },

    async onModalDeleteMultiProceed(): Promise<void> {
      try {
        this.modals.deleteMulti.loading = true;

        // Destroy room
        await Broker.$room.destroy(new JID(this.room.id as string));

        // Force reload all channels
        if (this.type === "channel") {
          Store.$channel.markChannelsChanged();
        }

        // Show success alert
        BaseAlert.success(
          "Deletion complete",
          `The ${this.type} has been destroyed`
        );

        this.modals.deleteMulti.visible = false;
      } catch (error) {
        this.$log.error(`Failed deleting ${this.type}`, error);

        // Show error alert
        BaseAlert.error(
          "Cannot delete",
          `The ${this.type} could not be destroyed`
        );
      } finally {
        this.modals.deleteMulti.loading = false;
      }
    },

    onModalDeleteMultiClose(): void {
      this.modals.deleteMulti.visible = false;
    }
  }
};
</script>
