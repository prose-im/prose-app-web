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
  class="p-edit-profile-authentication"
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
  FieldsetFieldDataButton as FormFieldsetFieldDataButton,
  FieldsetControlActionType as FormFieldsetControlActionType,
  FieldsetControlActionDataButton as FormFieldsetControlActionDataButton,
  FieldsetOptionAside as FormFieldsetOptionAside
} from "@/components/form/FormSettingsEditor.vue";

export default {
  name: "EditProfileAuthentication",

  components: { FormSettingsEditor },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    }
  },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "password",
          title: "Account password",

          fields: [
            {
              id: "password",
              type: FormFieldsetFieldType.Button,
              label: "Password:",

              data: {
                text: "Change password…",
                disabled: true
              } as FormFieldsetFieldDataButton
            }
          ],

          notes: [
            "Your password is what keeps your account secure. If you forget it, you can still recover it with the help of the server administrator."
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
