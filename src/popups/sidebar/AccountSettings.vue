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
  class="p-account-settings"
  actions-class="p-account-settings__actions"
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
      class="p-account-settings__actions-controls"
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
import AccountSettingsGeneral from "@/components/popups/sidebar/AccountSettingsGeneral.vue";
import AccountSettingsNotifications from "@/components/popups/sidebar/AccountSettingsNotifications.vue";
import AccountSettingsMessages from "@/components/popups/sidebar/AccountSettingsMessages.vue";
import AccountSettingsCalls from "@/components/popups/sidebar/AccountSettingsCalls.vue";
import AccountSettingsAdvanced from "@/components/popups/sidebar/AccountSettingsAdvanced.vue";

// CONSTANTS
const SECTION_INITIAL = "general";

export default {
  name: "AccountSettings",

  emits: ["close"],

  data() {
    return {
      // --> STATE <--

      section: SECTION_INITIAL,

      // --> DATA <--

      navigateSections: [
        {
          id: "general",
          title: "General",
          icon: "gearshape"
        },

        {
          id: "notifications",
          title: "Notifications",
          icon: "bell"
        },

        {
          id: "messages",
          title: "Messages",
          icon: "message"
        },

        {
          id: "calls",
          title: "Calls",
          icon: "phone.arrow.up.right"
        },

        {
          id: "advanced",
          title: "Advanced",
          icon: "dial.low"
        }
      ] as Array<NavigateSection>,

      contentSections: {
        general: {
          component: shallowRef(AccountSettingsGeneral)
        },

        notifications: {
          component: shallowRef(AccountSettingsNotifications)
        },

        messages: {
          component: shallowRef(AccountSettingsMessages)
        },

        calls: {
          component: shallowRef(AccountSettingsCalls)
        },

        advanced: {
          component: shallowRef(AccountSettingsAdvanced)
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

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-account-settings";

#{$c} {
  #{$c}__actions {
    display: flex;
    align-items: center;

    #{$c}__actions-controls {
      flex: 1;
    }
  }
}
</style>
