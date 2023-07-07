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
// PROJECT: COMPONENTS
import {
  default as EditProfileFormFieldset,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataButton as FormFieldsetFieldDataButton
} from "@/components/popups/sidebar/EditProfileFormFieldset.vue";

export default {
  name: "EditProfileProfile",

  components: { EditProfileFormFieldset },

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
                placeholder: "Enter your company name…"
              } as FormFieldsetFieldDataInput
            },

            {
              id: "title",
              type: FormFieldsetFieldType.Input,
              label: "Title:",

              data: {
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
              label: "Auto-detect:"
            },

            {
              id: "location",
              type: FormFieldsetFieldType.Input,
              label: "Location:",

              data: {
                placeholder: "Enter your city & country…"
              } as FormFieldsetFieldDataInput
            }
          ],

          notes: [
            "You can opt-in to automatic location updates based on your last used device location. It is handy if you travel a lot, and would like this to be auto-managed. Your current city and country will be shared, not your exact GPS location.",
            "Note that geolocation permissions are required for automatic mode."
          ]
        }
      ] as FormFieldset
    };
  }
};
</script>
