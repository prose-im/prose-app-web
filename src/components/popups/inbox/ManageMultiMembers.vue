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
  class="p-manage-multi-members"
  fieldset-class="p-manage-multi-members__fieldset"
  title-class="p-manage-multi-members__title"
  part-class="p-manage-multi-members__part"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef, PropType } from "vue";
import upperFirst from "lodash.upperfirst";
import { Room } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import {
  default as FormSettingsEditor,
  Fieldset as FormFieldset
} from "@/components/form/FormSettingsEditor.vue";
import ManageMultiMembersTable from "@/components/popups/inbox/ManageMultiMembersTable.vue";

export default {
  name: "ManageMultiMembers",

  components: { FormSettingsEditor, ManageMultiMembersTable },

  props: {
    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    },

    room: {
      type: Object as PropType<Room>,
      required: true
    },

    dataTableClass: {
      type: String,
      required: true
    }
  },

  emits: ["add"],

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
              component: shallowRef(ManageMultiMembersTable),

              properties: {
                room: this.room,
                type: this.type,
                dataTableClass: this.dataTableClass
              },

              listeners: {
                add: this.onMembersTableAdd
              }
            }
          ]
        }
      ] as Array<FormFieldset>
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onMembersTableAdd(): void {
      this.$emit("add");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-manage-multi-members";

.p-manage-multi-members {
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
