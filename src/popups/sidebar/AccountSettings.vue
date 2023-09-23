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
  class="p-account-settings"
  actions-class="p-account-settings__actions"
)
  template(
    v-slot:navigate
  )
    base-navigate(
      @navigate="onSectionsNavigate"
      :sections="sections"
      :active-id="section"
    )

  template(
    v-slot:form
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
// PROJECT: COMPONENTS
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";

export default {
  name: "AccountSettings",

  emits: ["close"],

  data() {
    return {
      // --> STATE <--

      section: null as string | null,

      // --> DATA <--

      sections: [
        {
          id: "general",
          title: "General",
          icon: "gearshape"
        },

        {
          id: "accounts",
          title: "Accounts",
          icon: "person.2"
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
      ] as Array<NavigateSection>
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

.p-account-settings {
  #{$c}__actions {
    display: flex;
    align-items: center;

    #{$c}__actions-controls {
      flex: 1;
    }
  }
}
</style>
