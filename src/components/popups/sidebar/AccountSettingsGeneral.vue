<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-account-settings-general
  settings-editor-form-fieldset(
    :fieldsets="fieldsets"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import {
  default as SettingsEditorFormFieldset,
  Fieldset as FormFieldset
} from "@/components/popups/sidebar/SettingsEditorFormFieldset.vue";

export default {
  name: "AccountSettingsGeneral",

  components: { SettingsEditorFormFieldset },

  data() {
    return {
      // --> DATA <--

      fieldsets: [] as Array<FormFieldset>
    };
  }
};
</script>
