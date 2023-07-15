<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-edit-profile-profile
  edit-profile-form-fieldset(
    :fieldsets="fieldsets"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@xmpp/jid";

// PROJECT: COMPONENTS
import {
  default as EditProfileFormFieldset,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataToggle as FormFieldsetFieldDataToggle,
  FieldsetControlActionType as FormFieldsetControlActionType,
  FieldsetControlActionDataButton as FormFieldsetControlActionDataButton,
  FieldsetControlIconType as FormFieldsetControlIconType
} from "@/components/popups/sidebar/EditProfileFormFieldset.vue";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "EditProfileProfile",

  components: { EditProfileFormFieldset },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    }
  },

  data() {
    return {
      // --> STATE <--

      form: {
        jobOrganization: "",
        jobTitle: "",
        locationCity: "",
        locationCountry: ""
      }
    };
  },

  computed: {
    fieldsets(): Array<FormFieldset> {
      return [
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
          ]
        },

        {
          id: "location",
          title: "Current location",

          fields: [
            {
              id: "automatic",
              type: FormFieldsetFieldType.Toggle,
              label: "Auto-detect:",

              data: {
                value: false,
                disabled: true
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
              type: FormFieldsetFieldType.Input,
              label: "Country:",

              data: {
                value: this.form.locationCountry,
                placeholder: "Enter your current country…"
              } as FormFieldsetFieldDataInput
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
          ]
        }
      ];
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    }
  },

  created() {
    // Populate form values
    if (this.profile.employment) {
      this.form.jobOrganization = this.profile.employment.organization || "";
      this.form.jobTitle = this.profile.employment.title || "";
    }

    if (this.profile.information && this.profile.information.location) {
      this.form.locationCity = this.profile.information.location.city || "";

      this.form.locationCountry =
        this.profile.information.location.country || "";
    }
  }
};
</script>
