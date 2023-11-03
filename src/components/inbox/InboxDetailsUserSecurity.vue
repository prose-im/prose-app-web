<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
list-disclosure(
  @toggle="onToggle"
  :header-class="headerClass"
  title="Security"
  class="c-inbox-details-user-security"
  separated
)
  list-entry(
    v-for="entry in entries"
    :key="entry.id"
    :class=`{
      [itemClass]: itemClass
    }`
  )
    template(
      v-slot:default
    )
      span(
        :class=`[
          "c-inbox-details-user-security__label",
          {
            "u-medium": entry.critical,
            "c-inbox-details-user-security__label--important": entry.important,
            "c-inbox-details-user-security__label--critical": entry.critical
          }
        ]`
      )
        | {{ entry.title }}

    template(
      v-slot:icon
    )
      base-icon(
        v-if="entry.icon && entry.kind"
        :name="entry.icon"
        :class=`[
          "c-inbox-details-user-security__icon",
          "c-inbox-details-user-security__icon--" + entry.id + "-" + entry.kind
        ]`
        size="16px"
      )

    template(
      v-slot:details
    )
      a.c-inbox-details-user-security__details
        base-icon(
          @click="onDetailsIconClick(entry.id)"
          name="info.circle"
          size="13px"
          class="c-inbox-details-user-security__details-icon"
        )

        base-popover(
          v-if="detailsPopover.id === entry.id"
          v-click-away="onDetailsPopoverClickAway"
          class="c-inbox-details-user-security__details-popover"
        )
          component(
            :is="detailsPopover.component"
            :jid="jid"
            spacing-block-class="c-inbox-details-user-security__details-popover-spacing-block"
            spacing-inline-class="c-inbox-details-user-security__details-popover-spacing-inline"
          )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef, PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import InboxDetailsUserSecurityDetailsIdentity from "@/components/inbox/InboxDetailsUserSecurityDetailsIdentity.vue";
import InboxDetailsUserSecurityDetailsEncryption from "@/components/inbox/InboxDetailsUserSecurityDetailsEncryption.vue";

// PROJECT: STORES
import Store from "@/store";

// INTERFACES
interface Entry {
  id: string;
  title: string;
  kind?: string;
  icon?: string;
  important?: boolean;
  critical?: boolean;
}

export default {
  name: "InboxDetailsUserSecurity",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    headerClass: {
      type: String,
      default: null
    },

    itemClass: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      // --> STATE <--

      detailsPopover: {
        id: "",
        component: null as object | null
      }
    };
  },

  computed: {
    entries(): Array<Entry> {
      const entries = [];

      if (this.profile.security) {
        if (this.profile.security.verification) {
          entries.push({
            id: "identity",
            kind: "verified",
            title: "Identity verified",
            icon: "checkmark.seal.fill"
          });
        } else {
          entries.push({
            id: "identity",
            kind: "unknown",
            title: "Identity unknown",
            icon: "xmark.seal.fill"
          });
        }

        if (
          !this.profile.security.encryption ||
          !this.profile.security.encryption.connectionProtocol
        ) {
          // No connection available (might be insecure?)
          entries.push({
            id: "encryption",
            kind: "unknown",
            title: "Unknown security",
            icon: "exclamationmark.lock.fill",
            important: true
          });
        } else if (!this.profile.security.encryption.secureProtocol) {
          // No encryption whatsoever (insecure!)
          entries.push({
            id: "encryption",
            kind: "insecure",
            title: "Insecure channel",
            icon: "lock.slash.fill",
            critical: true
          });
        } else if (!this.profile.security.encryption.messageEndToEndMethod) {
          // Okay-level of encryption (C2S)
          entries.push({
            id: "encryption",
            kind: "safe",
            title: "Partially encrypted",
            icon: "lock.fill"
          });
        } else {
          // Best level of encryption (C2S + E2E)
          entries.push({
            id: "encryption",
            kind: "secure",
            title:
              `Encrypted ` +
              `(${this.profile.security.encryption.messageEndToEndMethod})`,
            icon: "lock.fill"
          });
        }
      }

      return entries;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onToggle(visible: boolean): void {
      Store.$layout.setInboxDetailsSectionSecurity(visible);
    },

    onDetailsIconClick(id: string): void {
      let component;

      switch (id) {
        case "identity": {
          component = InboxDetailsUserSecurityDetailsIdentity;

          break;
        }

        case "encryption": {
          component = InboxDetailsUserSecurityDetailsEncryption;

          break;
        }

        default: {
          component = null;
        }
      }

      if (component !== null) {
        this.detailsPopover.id = id;
        this.detailsPopover.component = shallowRef(component);
      }
    },

    onDetailsPopoverClickAway(): void {
      this.detailsPopover.id = "";
      this.detailsPopover.component = null;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-details-user-security";

.c-inbox-details-user-security {
  #{$c}__icon {
    &--identity-verified {
      fill: rgb(var(--color-base-green-normal));
    }

    &--identity-unknown {
      fill: rgb(var(--color-base-grey-normal));
    }

    &--encryption-secure {
      fill: rgb(var(--color-base-blue-dark));
    }

    &--encryption-safe {
      fill: rgb(var(--color-base-grey-dark));
    }

    &--encryption-unknown {
      fill: rgb(var(--color-base-orange-normal));
    }

    &--encryption-insecure {
      fill: rgb(var(--color-base-red-normal));
    }
  }

  #{$c}__label {
    &--important {
      color: rgb(var(--color-base-orange-normal));
    }

    &--critical {
      color: rgb(var(--color-base-red-normal));
    }
  }

  #{$c}__details {
    position: relative;

    #{$c}__details-icon {
      fill: rgba(var(--color-base-grey-dark), 0.65);
      cursor: pointer;
      display: block;

      &:hover {
        fill: rgba(var(--color-base-grey-dark), 0.8);
      }

      &:active {
        fill: rgb(var(--color-base-grey-dark));
      }
    }

    #{$c}__details-popover {
      color: rgb(var(--color-text-primary));
      width: (
        $size-inbox-details-width -
          (
            2 *
              (
                $size-inbox-details-item-padding-sides -
                  $size-base-popover-list-inset-block-edge-offset
              )
          )
      );
      padding: 0;
      position: absolute;
      inset-inline-end: (-1 * $size-base-popover-list-inset-block-edge-offset);
      inset-block-end: calc(
        100% + #{$size-base-popover-list-inset-block-edge-offset}
      );
      z-index: 1;
      overflow: hidden;
      cursor: default;

      #{$c}__details-popover-spacing-block {
        padding-block: 10px;
      }

      #{$c}__details-popover-spacing-inline {
        padding-inline: 14px;
      }
    }
  }
}
</style>
