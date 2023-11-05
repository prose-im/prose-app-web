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
  class="p-manage-group-members"
  fieldset-class="p-manage-group-members__fieldset"
  title-class="p-manage-group-members__title"
  part-class="p-manage-group-members__part"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";
import upperFirst from "lodash.upperfirst";

// PROJECT: COMPONENTS
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetFieldDataTextarea as FormFieldsetFieldDataTextarea
} from "@/components/form/FormSettingsEditor.vue";
import ManageGroupMembersTable from "@/components/popups/inbox/ManageGroupMembersTable.vue";

export default {
  name: "ManageGroupMembers",

  components: { FormSettingsEditor, ManageGroupMembersTable },

  props: {
    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    dataTableClass: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      // --> DATA <--

      fieldsets: [
        {
          id: "members",
          title: `${upperFirst(this.type)} members`,

          parts: [
            {
              id: "table",
              component: shallowRef(ManageGroupMembersTable),

              properties: {
                dataTableClass: this.dataTableClass
              }
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-manage-group-members";

.p-manage-group-members {
  &,
  #{$c}__fieldset {
    display: flex;
    flex-direction: column;
  }

  #{$c}__fieldset {
    flex: 1;

    #{$c}__title {
      flex: 0 0 auto;
    }

    #{$c}__part {
      flex: 1;
    }
  }
}
</style>
