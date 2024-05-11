<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-popup-navigate(
  @close="onClose"
  :content-section="section"
  size="small"
  class="p-encryption-settings"
)
  template(
    v-slot:navigate
  )
    base-navigate(
      @navigate="onSectionsNavigate"
      :sections="navigateSections"
      :active-id="section"
    )

  template(
    v-slot:content
  )
    component(
      v-if="contentSections[section]"
      v-bind="contentSections[section].properties"
      :is="contentSections[section].component"
    )

  template(
    v-slot:actions
  )
    base-popup-actions(
      @cancel="onClose"
      :confirm="false"
      cancel-label="Close"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";

// PROJECT: COMPONENTS
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import AccountSettingsIdentities from "@/components/popups/inbox/AccountSettingsIdentities.vue";
import AccountSettingsPreferences from "@/components/popups/inbox/AccountSettingsPreferences.vue";

export default {
  name: "EncryptionSettings",

  components: { AccountSettingsIdentities, AccountSettingsPreferences },

  props: {
    sectionInitial: {
      type: String,
      default: "identities"
    }
  },

  emits: ["close"],

  data() {
    return {
      // --> STATE <--

      section: this.sectionInitial,

      // --> DATA <--

      navigateSections: [
        {
          id: "identities",
          title: "Identities",
          icon: "checkmark.seal.fill"
        },

        {
          id: "preferences",
          title: "Preferences",
          icon: "gearshape"
        }
      ] as Array<NavigateSection>,

      contentSections: {
        identities: {
          component: shallowRef(AccountSettingsIdentities)
        },

        preferences: {
          component: shallowRef(AccountSettingsPreferences)
        }
      }
    };
  },

  methods: {
    // --> HELPERS <--

    onSectionsNavigate(sectionId: string): void {
      this.section = sectionId;
    },

    // --> EVENT LISTENERS <--

    onClose(): void {
      this.$emit("close");
    }
  }
};
</script>
