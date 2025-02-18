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
  FieldsetFieldAside as FormFieldsetFieldAside,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldAsideType as FormFieldsetFieldAsideType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetOptionAside as FormFieldsetOptionAside
} from "@/components/form/FormSettingsEditor.vue";

// PROJECT: POPUPS
import { FormIdentity as ProfileFormIdentity } from "@/popups/sidebar/EditProfile.vue";

// CONSTANTS
const ASIDE_NONE: FormFieldsetFieldAside = {
  type: FormFieldsetFieldAsideType.Label,
  color: "grey",
  icon: "exclamationmark.circle.fill",
  label: "None set"
};

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

  computed: {
    fieldsets(): Array<FormFieldset> {
      return [
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
              } as FormFieldsetFieldDataInput,

              aside: !this.form.nameFirst.inner ? ASIDE_NONE : undefined
            },

            {
              id: "name_last",
              type: FormFieldsetFieldType.Input,
              label: "Last name:",

              data: {
                value: this.form.nameLast,
                placeholder: "Enter your last name…"
              } as FormFieldsetFieldDataInput,

              aside: !this.form.nameLast.inner ? ASIDE_NONE : undefined
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

              aside: !this.form.email.inner ? ASIDE_NONE : undefined
            },

            {
              id: "phone",
              type: FormFieldsetFieldType.Input,
              label: "Phone:",

              data: {
                value: this.form.phone,
                placeholder: "Enter your phone number…"
              } as FormFieldsetFieldDataInput,

              aside: !this.form.phone.inner ? ASIDE_NONE : undefined
            }
          ],

          notes: [
            "Your email address and phone number are public. They are visible to all team members and contacts. They will not be available to other users."
          ],

          options: {
            aside: FormFieldsetOptionAside.Fixed
          }
        }
      ];
    }
  }
};
</script>
