<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-edit-profile-identity
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
  FieldsetFieldAsideType as FormFieldsetFieldAsideType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput
} from "@/components/popups/sidebar/EditProfileFormFieldset.vue";

export default {
  name: "EditProfileIdentity",

  components: { EditProfileFormFieldset },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "name",
          title: "Name",

          fields: [
            {
              id: "name_first",
              type: FormFieldsetFieldType.Input,
              label: "First name:",

              data: {
                value: "",
                placeholder: "Enter your first name…"
              } as FormFieldsetFieldDataInput,

              aside: {
                type: FormFieldsetFieldAsideType.Link,
                label: "Get verified"
              }
            },

            {
              id: "name_last",
              type: FormFieldsetFieldType.Input,
              label: "Last name:",

              data: {
                value: "",
                placeholder: "Enter your last name…"
              } as FormFieldsetFieldDataInput
            }
          ],

          notes: [
            "In order to show a verified badge on your profile, visible to other users, you should get your real identity verified (first name & last name). The process takes a few seconds: you will be asked to submit a government ID (ID card, password or driving license). Note that the verified status is optional.",
            "Your data will be processed on an external service. This service does not keep any record of your ID after your verified status is confirmed."
          ]
        },

        {
          id: "contact",
          title: "Contact information",

          fields: [
            {
              id: "email",
              type: FormFieldsetFieldType.Input,
              label: "Email:",

              data: {
                value: "",
                placeholder: "Enter your email address…"
              } as FormFieldsetFieldDataInput,

              aside: {
                type: FormFieldsetFieldAsideType.Label,
                color: "green",
                icon: "checkmark.seal.fill",
                label: "Verified"
              }
            },

            {
              id: "phone",
              type: FormFieldsetFieldType.Input,
              label: "Phone:",

              data: {
                value: "",
                placeholder: "Enter your phone number…"
              } as FormFieldsetFieldDataInput,

              aside: {
                type: FormFieldsetFieldAsideType.Link,
                label: "Get verified"
              }
            }
          ],

          notes: [
            "Your email address and phone number are public. They are visible to all team members and contacts. They will not be available to other users.",
            "It is recommended that your email address and phone number each get verified, as this increases the level of trust of your profile. The process only takes a few seconds: you will receive a link to verify your contact details."
          ]
        }
      ] as FormFieldset
    };
  }
};
</script>
