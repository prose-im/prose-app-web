<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-view(
  :topbar-component="topbarComponent"
  :topbar-properties="topbarProperties"
  class="v-app-spotlight-browse"
)
  template(
    v-slot:default
  )
    spotlight-browse-navigate(
      class="v-app-spotlight-browse__navigate"
    )

    .v-app-spotlight-browse__content
      router-view(
        class="v-app-spotlight-browse__content-inner"
      )

  template(
    v-slot:modals
  )
    add-external-contact(
      v-if="modals.addExternalContact.visible"
      @add="onModalAddExternalContactAdd"
      @close="onModalAddExternalContactClose"
      :loading="modals.addExternalContact.loading"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: ASSEMBLIES
import {
  default as SpotlightTopbar,
  Actions as SpotlightTopbarActions
} from "@/assemblies/spotlight/SpotlightTopbar.vue";
import SpotlightBrowseNavigate from "@/components/spotlight/browse/SpotlightBrowseNavigate.vue";

// PROJECT: MODALS
import AddExternalContact from "@/modals/spotlight/AddExternalContact.vue";

// PROJECT: BROKER
import Broker from "@/broker";

export default {
  name: "AppSpotlightBrowse",

  components: { SpotlightBrowseNavigate, AddExternalContact },

  data() {
    return {
      // --> STATE <--

      modals: {
        addExternalContact: {
          visible: false,
          loading: false
        }
      },

      // --> DATA <--

      topbarComponent: shallowRef(SpotlightTopbar),

      topbarProperties: {
        actions: [
          [
            {
              icon: {
                name: "person.crop.circle.badge.plus",
                size: "26px"
              },

              tooltip: "Add External Contact",
              click: this.onTopbarActionAddExternalContactClick
            }
          ]
        ] as SpotlightTopbarActions
      }
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onTopbarActionAddExternalContactClick(): void {
      this.modals.addExternalContact.visible = true;
    },

    async onModalAddExternalContactAdd(jid: JID): Promise<void> {
      try {
        this.modals.addExternalContact.loading = true;

        // Add external contact
        await Broker.$roster.addContact(jid);

        // Show success alert
        BaseAlert.success(
          "External contact added",
          "Your contact has received an invitation"
        );

        this.modals.addExternalContact.visible = false;
      } catch (error) {
        this.$log.error("Failed adding external contact", error);

        // Show error alert
        BaseAlert.error(
          "Cannot add external contact",
          "Your contact could not be added. Try again?"
        );
      } finally {
        this.modals.addExternalContact.loading = false;
      }
    },

    onModalAddExternalContactClose(): void {
      this.modals.addExternalContact.visible = false;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-spotlight-browse";

.v-app-spotlight-browse {
  #{$c}__navigate,
  #{$c}__content {
    height: 100%;
  }

  #{$c}__navigate {
    border-inline-end: 1px solid rgb(var(--color-border-secondary));
    width: 220px;
    flex: 0 0 auto;
  }

  #{$c}__content {
    padding-inline: $size-layout-view-content-padding-sides;
    overflow-x: hidden;
    overflow-y: auto;
    flex: 1;

    #{$c}__content-inner {
      max-width: 720px;
      margin: 0 auto;
    }
  }
}
</style>
