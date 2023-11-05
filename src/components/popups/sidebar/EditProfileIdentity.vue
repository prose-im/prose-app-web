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
  class="p-edit-profile-identity"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldAsideType as FormFieldsetFieldAsideType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput
} from "@/components/form/FormSettingsEditor.vue";

// PROJECT: POPUPS
import { FormIdentity as ProfileFormIdentity } from "@/popups/sidebar/EditProfile.vue";

export default {
  name: "EditProfileIdentity",

  components: { FormSettingsEditor },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    form: {
      type: Object as PropType<ProfileFormIdentity>,
      required: true
    }
  },

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
                value: this.form.nameFirst,
                placeholder: "Enter your first name…"
              } as FormFieldsetFieldDataInput,

              aside: {
                type: FormFieldsetFieldAsideType.Link,
                label: "Get verified",
                disabled: true
              }
            },

            {
              id: "name_last",
              type: FormFieldsetFieldType.Input,
              label: "Last name:",

              data: {
                value: this.form.nameLast,
                placeholder: "Enter your last name…"
              } as FormFieldsetFieldDataInput
            }
          ],

          notes: [
            "In order to show a verified badge on your profile, visible to other users, you should get your real identity verified (first name & last name). The process takes a few seconds: you will be asked to submit a government ID (ID card, password or driving license). Note that the verified status is optional.",
            "Your data will be processed on an external service. This service does not keep any record of your ID after your verified status is confirmed."
          ],

          options: {
            aside: true
          }
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
                value: this.form.email,
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
                value: this.form.phone,
                placeholder: "Enter your phone number…"
              } as FormFieldsetFieldDataInput,

              aside: {
                type: FormFieldsetFieldAsideType.Link,
                label: "Get verified",
                disabled: true
              }
            }
          ],

          notes: [
            "Your email address and phone number are public. They are visible to all team members and contacts. They will not be available to other users.",
            "It is recommended that your email address and phone number each get verified, as this increases the level of trust of your profile. The process only takes a few seconds: you will receive a link to verify your contact details."
          ],

          options: {
            aside: true
          }
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>
