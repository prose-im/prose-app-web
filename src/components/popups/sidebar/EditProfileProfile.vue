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
  class="p-edit-profile-profile"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef, PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";
import { countries } from "crisp-countries-languages";

// PROJECT: COMPONENTS
import BaseFlag from "@/components/base/BaseFlag.vue";
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataSelect as FormFieldsetFieldDataSelect,
  FieldsetFieldDataToggle as FormFieldsetFieldDataToggle,
  FieldsetControlActionType as FormFieldsetControlActionType,
  FieldsetControlActionDataButton as FormFieldsetControlActionDataButton,
  FieldsetControlIconType as FormFieldsetControlIconType,
  FieldsetOptionAside as FormFieldsetOptionAside
} from "@/components/form/FormSettingsEditor.vue";

// PROJECT: POPUPS
import { FormProfile as ProfileFormProfile } from "@/popups/sidebar/EditProfile.vue";

export default {
  name: "EditProfileProfile",

  components: { FormSettingsEditor },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    form: {
      type: Object as PropType<ProfileFormProfile>,
      required: true
    }
  },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "job",
          title: "Job information",

          fields: [
            {
              id: "organization",
              type: FormFieldsetFieldType.Input,
              label: "Organization:",

              data: {
                value: this.form.jobOrganization,
                placeholder: "Enter your company name…"
              } as FormFieldsetFieldDataInput
            },

            {
              id: "title",
              type: FormFieldsetFieldType.Input,
              label: "Title:",

              data: {
                value: this.form.jobTitle,
                placeholder: "Enter your job title…"
              } as FormFieldsetFieldDataInput
            }
          ],

          notes: [
            "Your current organization and job title are shared with your team members and contacts to identify your position within your company."
          ],

          options: {
            aside: FormFieldsetOptionAside.Fixed
          }
        },

        {
          id: "location",
          title: "Current location",

          fields: [
            {
              // TODO: implement functionality using this option
              id: "automatic",
              type: FormFieldsetFieldType.Toggle,
              label: "Auto-detect:",

              data: {
                value: {
                  inner: false
                }
              } as FormFieldsetFieldDataToggle
            },

            {
              id: "city",
              type: FormFieldsetFieldType.Input,
              label: "City:",

              data: {
                value: this.form.locationCity,
                placeholder: "Enter your current city…"
              } as FormFieldsetFieldDataInput
            },

            {
              id: "country",
              type: FormFieldsetFieldType.Select,
              label: "Country:",

              data: {
                value: this.form.locationCountry,
                placeholder: "Pick a country…",

                options: countries.map(country => {
                  return {
                    value: country.code,
                    label: country.name
                  };
                }),

                icon: {
                  component: shallowRef(BaseFlag),

                  properties: (value: string) => {
                    return {
                      code: value,
                      width: "20px",
                      height: "15px",
                      shadow: "none"
                    };
                  }
                }
              } as FormFieldsetFieldDataSelect
            }
          ],

          controls: [
            {
              id: "location-mode",
              label: "Location mode:",
              value: "Manual", // TODO: need to geocode lat/lon to city/country
              icon: FormFieldsetControlIconType.LocationInactive
            },

            {
              id: "location-permission",
              label: "Geolocation permission:",
              value: "Disallowed", // TODO: from configuration

              actions: [
                {
                  type: FormFieldsetControlActionType.Button,

                  data: {
                    text: "Manage",
                    disabled: true
                  } as FormFieldsetControlActionDataButton
                }
              ]
            }
          ],

          notes: [
            "You can opt-in to automatic location updates based on your last used device location. It is handy if you travel a lot, and would like this to be auto-managed. Your current city and country will be shared, not your exact GPS location.",
            "Note that geolocation permissions are required for automatic mode."
          ],

          options: {
            aside: FormFieldsetOptionAside.Fixed
          }
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
