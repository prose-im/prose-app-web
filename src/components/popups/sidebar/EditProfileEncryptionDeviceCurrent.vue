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
    base-platform-logo(
      :name="snapshot.platform"
      class="p-edit-profile-encryption-device-current__snapshot-platform"
    )

    .p-edit-profile-encryption-device-current__snapshot-text
      p.p-edit-profile-encryption-device-current__snapshot-system.u-medium
        | {{ snapshot.system }}

      p.p-edit-profile-encryption-device-current__snapshot-client
        | {{ snapshot.client }}

      p.p-edit-profile-encryption-device-current__snapshot-security.u-medium
        a(
          :href="snapshot.security.target"
          rel="noopener noreferrer"
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
// PROJECT: BROKER
import {
  VERSION_NAME,
  VERSION_SYSTEM,
  VERSION_REVISION
} from "@/broker/context";

// CONSTANTS
// TODO: import this from the JS SDK?
// TODO: from local OMEMO library version tag
const OMEMO_VERSION = "0.0.0";

export default {
  name: "EditProfileEncryptionDeviceCurrent",

  data() {
    return {
      // --> DATA <--

      snapshot: {
        platform: "web",
        system: VERSION_SYSTEM,
        client: `${VERSION_NAME} ${VERSION_REVISION}`,

        security: {
          label: `OMEMO v${OMEMO_VERSION}`,
          target: "https://xmpp.org/extensions/xep-0384.html"
        }
      },

      details: [
        {
          label: "Device name:",
          value: "(none)" // TODO: from dynamic data
        },

        {
          label: "Device ID:",
          value: "(none)" // TODO: from dynamic data
        },

        {
          label: "Security hash:",
          value: "(none)", // TODO: from dynamic data

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

#{$c} {
  display: flex;
  align-items: center;

  #{$c}__snapshot {
    border-inline-end: 1px solid rgb(var(--color-border-secondary));
    padding-inline-end: $inner-spacing-sides;
    display: flex;
    align-items: flex-start;

    #{$c}__snapshot-platform {
      margin-inline-end: 12px;
      flex: 0 0 auto;
    }

    #{$c}__snapshot-text {
      padding-block-start: 2px;
      flex: 1;

      #{$c}__snapshot-system {
        color: rgb(var(--color-text-primary));
        font-size: $font-size-baseline;
      }

      #{$c}__snapshot-client {
        color: rgb(var(--color-text-secondary));
        font-size: ($font-size-baseline - 1.5px);
        margin-block-start: 3px;
      }

      #{$c}__snapshot-security {
        font-size: ($font-size-baseline - 3px);
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
