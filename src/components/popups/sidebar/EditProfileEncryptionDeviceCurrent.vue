<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-edit-profile-encryption-device-current
  .p-edit-profile-encryption-device-current__snapshot
    //- TODO: into component
    .p-edit-profile-encryption-device-current__snapshot-platform

    .p-edit-profile-encryption-device-current__snapshot-text
      p.p-edit-profile-encryption-device-current__snapshot-system.u-medium
        | {{ snapshot.system }}

      p.p-edit-profile-encryption-device-current__snapshot-client
        | {{ snapshot.client }}

      p.p-edit-profile-encryption-device-current__snapshot-security.u-medium
        a(
          :href="snapshot.security.target"
          target="_blank"
        )
          | {{ snapshot.security.label }}

  .p-edit-profile-encryption-device-current__details
    form-fieldset-control(
      v-for="detail in details"
      :label="detail.label"
      class="p-edit-profile-encryption-device-current__details-control"
    )
      template(
        v-slot:default
      )
        | {{ detail.value }}

      template(
        v-if="detail.actions && detail.actions.length > 0"
        v-slot:actions
      )
        base-button(
          v-for="action in detail.actions"
          :disabled="action.disabled"
          tint="light"
          size="mid-small"
        )
          | {{ action.text }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PACKAGE
import * as projectPackage from "@/../package.json";

// PROJECT: BROKER
import {
  VERSION_NAME,
  VERSION_SYSTEM,
  VERSION_REVISION_FALLBACK
} from "@/broker/stanzas/iq";

// CONSTANTS
const OMEMO_VERSION = "0.8.3"; // TODO: from local OMEMO library version tag

export default {
  name: "EditProfileEncryptionDeviceCurrent",

  data() {
    return {
      // --> DATA <--

      snapshot: {
        system: VERSION_SYSTEM,
        client: `${VERSION_NAME} ${
          projectPackage.version || VERSION_REVISION_FALLBACK
        }`,

        security: {
          label: `OMEMO v${OMEMO_VERSION}`,

          target:
            `https://xmpp.org/extensions/attic/` +
            `xep-0384-${OMEMO_VERSION}.html`
        }
      },

      details: [
        {
          label: "Device name:",
          value: "Prose (Firefox)" // TODO: from dynamic data
        },

        {
          label: "Device ID:",
          value: "120645" // TODO: from dynamic data
        },

        {
          label: "Security hash:",
          value: "ERT65", // TODO: from dynamic data

          actions: [
            {
              text: "Roll",
              disabled: true // TODO: bind this action
            }
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
$c: ".p-edit-profile-encryption-device-current";

// VARIABLES
$inner-spacing-sides: 18px;

.p-edit-profile-encryption-device-current {
  display: flex;
  align-items: center;

  #{$c}__snapshot {
    border-right: 1px solid $color-border-secondary;
    padding-inline-end: $inner-spacing-sides;
    display: flex;
    align-items: flex-start;

    #{$c}__snapshot-platform {
      background-color: $color-white;
      border: 0.5px solid $color-black;
      width: 38px;
      height: 52px;
      margin-inline-end: 11px;
      border-radius: 4px;
    }

    #{$c}__snapshot-text {
      padding-block-start: 2px;

      #{$c}__snapshot-system {
        color: $color-text-primary;
        font-size: 14px;
      }

      #{$c}__snapshot-client {
        color: $color-text-secondary;
        font-size: 12.5px;
        margin-block-start: 3px;
      }

      #{$c}__snapshot-security {
        font-size: 11px;
        margin-block-start: 9px;

        a {
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  #{$c}__details {
    margin-inline-start: $inner-spacing-sides;

    #{$c}__details-control {
      height: 20px;
    }
  }
}
</style>
