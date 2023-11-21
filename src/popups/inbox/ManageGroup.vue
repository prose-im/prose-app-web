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
  :content-section="section"
  :class=`[
    "p-manage-group",
    "p-manage-group--" + section
  ]`
  size="small"
  content-class="p-manage-group__form"
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
      class="p-manage-group__form-inner"
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
import { shallowRef, PropType } from "vue";
import { Room } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import ManageGroupAbout from "@/components/popups/inbox/ManageGroupAbout.vue";
import ManageGroupMembers from "@/components/popups/inbox/ManageGroupMembers.vue";
import ManageGroupSettings from "@/components/popups/inbox/ManageGroupSettings.vue";

// TYPES
type FormValueString = { inner: string };

// INTERFACES
export interface FormSettings {
  name: FormValueString;
}

// CONSTANTS
const SECTION_INITIAL = "about";

export default {
  name: "ManageGroup",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    },

    type: {
      type: String,
      default: "channel",

      validator(x: string) {
        return ["channel", "group"].includes(x);
      }
    }
  },

  emits: ["close"],

  data() {
    return {
      // --> STATE <--

      section: SECTION_INITIAL,

      // --> DATA <--

      navigateSections: [
        {
          id: "about",
          title: "About",
          icon: "megaphone.fill"
        },

        {
          id: "members",
          title: "Members",
          icon: "person.fill.viewfinder"
        },

        {
          id: "settings",
          title: "Settings",
          icon: "gearshape.fill"
        }
      ] as Array<NavigateSection>,

      contentSections: {
        about: {
          component: shallowRef(ManageGroupAbout),

          properties: {
            type: this.type
          }
        },

        members: {
          component: shallowRef(ManageGroupMembers),

          properties: {
            type: this.type,
            room: this.room,
            dataTableClass: "p-manage-group__form-offset-sides"
          }
        },

        settings: {
          component: shallowRef(ManageGroupSettings),

          properties: {
            type: this.type,
            room: this.room,

            form: {
              name: { inner: this.room.name }
            } as FormSettings
          }
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
$c: ".p-manage-group";

.p-manage-group {
  #{$c}__form {
    #{$c}__form-offset-sides {
      margin-inline: (-1 * $size-layout-popup-navigate-padding-inline);
    }
  }

  // --> SECTIONS <--

  &--members {
    #{$c}__form {
      display: flex;
      flex-direction: column;

      #{$c}__form-inner {
        flex: 1;
      }
    }
  }
}
</style>
