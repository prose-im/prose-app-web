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
  Fieldset as FormFieldset
} from "@/components/popups/sidebar/EditProfileFormFieldset.vue";

export default {
  name: "EditProfileProfile",

  components: { EditProfileFormFieldset },

  data() {
    return {
      // --> DATA <--

      fieldsets: [] as FormFieldset
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-edit-profile-profile";

.p-edit-profile-profile {
  /* TODO */
}
</style>
