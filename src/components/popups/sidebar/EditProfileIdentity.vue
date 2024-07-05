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
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetOptionAside as FormFieldsetOptionAside
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
          id: "full_name",
          title: "Full name",

          fields: [
            {
              id: "name_first",
              type: FormFieldsetFieldType.Input,
              label: "First name:",

              data: {
                value: this.form.nameFirst,
                placeholder: "Enter your first name…"
              } as FormFieldsetFieldDataInput
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
            "Your full name is visible from everyone in your team. It should be your real name. If you want to specify a different display name, you can set it right below."
          ],

          options: {
            aside: FormFieldsetOptionAside.Fixed
          }
        },

        {
          id: "display_name",
          title: "Display name",

          fields: [
            {
              id: "nickname",
              type: FormFieldsetFieldType.Input,
              label: "Name:",

              data: {
                value: this.form.nickname,
                placeholder: "Enter a display name…"
              } as FormFieldsetFieldDataInput
            }
          ],

          notes: [
            "You can opt to specify a display name that's different from your full name, if you want people to refer to you using a different name."
          ],

          options: {
            aside: FormFieldsetOptionAside.Fixed
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
              } as FormFieldsetFieldDataInput
            }
          ],

          notes: [
            "Your email address and phone number are public. They are visible to all team members and contacts. They will not be available to other users.",
            "Make sure that your email address is verified, for account security purposes."
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
