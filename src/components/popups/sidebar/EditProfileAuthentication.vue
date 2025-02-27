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

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: STORES
import Store from "@/store";

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

// PROJECT: POPUPS
import { FormAuthentication as ProfileFormAuthentication } from "@/popups/sidebar/EditProfile.vue";

export default {
  name: "EditProfileAuthentication",

  components: { FormSettingsEditor },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    form: {
      type: Object as PropType<ProfileFormAuthentication>,
      required: true
    }
  },

  data() {
    return {
      // --> STATE <--

      actions: {
        changePassword: {
          visible: false,
          saving: false
        }
      }
    };
  },

  computed: {
    fieldsets(): Array<FormFieldset> {
      return [
        {
          id: "password",
          title: "Account password",

          fields: [
            this.actions.changePassword.visible === true
              ? {
                  id: "password-action",
                  type: FormFieldsetFieldType.Input,
                  label: "Password:",

                  data: {
                    value: this.form.newPassword,
                    type: "password",
                    placeholder: "Enter your new password…",
                    autofocus: true,
                    disabled: this.actions.changePassword.saving,
                    loading: this.actions.changePassword.saving
                  } as FormFieldsetFieldDataInput,

                  aside: {
                    type: FormFieldsetFieldAsideType.Link,
                    label: "Change",
                    disabled: this.actions.changePassword.saving,
                    click: this.onFieldsetPasswordActionApplyClick
                  }
                }
              : {
                  id: "password-change",
                  type: FormFieldsetFieldType.Button,
                  label: "Password:",

                  data: {
                    text: "Change password…",
                    click: this.onFieldsetPasswordChangeClick
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
      ];
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    async onFieldsetPasswordChangeClick(): Promise<void> {
      this.actions.changePassword.visible = true;
    },

    async onFieldsetPasswordActionApplyClick(): Promise<void> {
      if (this.actions.changePassword.saving !== true) {
        try {
          // Mark as saving
          this.actions.changePassword.saving = true;

          const newPassword = this.form.newPassword.inner || null;

          if (newPassword === null) {
            throw new Error("No new password");
          }

          // Set new password
          await Broker.$account.changePassword(newPassword);

          // Update stored account password
          Store.$account.setCredentialsPassword(newPassword);

          // Show success alert
          BaseAlert.success(
            "Password changed",
            "Your account password has been changed"
          );

          // Close change password action
          this.actions.changePassword.visible = false;
        } catch (error) {
          this.$log.error("Failed changing password", error);

          // Show error alert
          BaseAlert.error(
            "Cannot change password",
            "Your account password could not be changed"
          );
        } finally {
          this.actions.changePassword.saving = false;
        }
      }
    }
  }
};
</script>
