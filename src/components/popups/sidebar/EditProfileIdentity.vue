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
  form-fieldset.p-edit-profile-identity__fieldset(
    v-for="fieldset in fieldsets"
    :id="'fieldset_' + fieldset.id"
  )
    h6.p-edit-profile-identity__title.u-medium
      | {{ fieldset.title }}

    form-fieldset-field(
      v-for="field in fieldset.fields"
      :label="field.label"
      class="p-edit-profile-identity__field"
    )
      template(
        v-slot:default
      )
        form-field(
          :name="field.id"
          :placeholder="field.placeholder"
          type="text"
          size="mid-medium"
          align="left"
        )

      template(
        v-slot:aside
      )
        .p-edit-profile-identity__field-aside
          a.u-medium(
            v-if="field.aside"
          )
            | {{ field.aside.label }}

    form-fieldset-notes(
      v-if="fieldset.notes"
    )
      p(
        v-for="note in fieldset.notes"
      )
        | {{ note }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "EditProfileIdentity",

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
              label: "First name:",
              placeholder: "Enter your first name…",

              aside: {
                label: "Get verified"
              }
            },

            {
              id: "name_last",
              label: "Last name:",
              placeholder: "Enter your last name…"
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
              label: "Email:",
              placeholder: "Enter your email address…",

              aside: {
                label: "Get verified"
              }
            },

            {
              id: "phone",
              label: "Phone:",
              placeholder: "Enter your phone number…",

              aside: {
                label: "Get verified"
              }
            }
          ],

          notes: [
            "Your email address and phone number are public. They are visible to all team members and contacts. They will not be available to other users.",
            "It is recommended that your email address and phone number each get verified, as this increases the level of trust of your profile. The process only takes a few seconds: you will receive a link to verify your contact details."
          ]
        }
      ]
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-edit-profile-identity";

.p-edit-profile-identity {
  #{$c}__title {
    color: $color-text-secondary;
    font-size: 14.5px;
    margin-block-end: 16px;
  }

  #{$c}__field {
    #{$c}__field-aside {
      margin-inline-start: 11px;
      margin-block-start: -3px;
      min-width: 120px;

      a {
        font-size: 13.5px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
