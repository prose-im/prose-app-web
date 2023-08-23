<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-modal(
  @close="$emit('close')"
  @confirm="onConfirm"
  confirm-label="Send Request"
  class="m-add-contact"
  size="large"
)
  template(
    v-if="isMember"
  )
    p.u-medium
      | Add a new member

    p.u-regular
      | Add an existing chat address, or invite an email to join your team.

  template(
    v-else
  )
    p.u-medium
      | Connect with someone

    p.u-regular
      | Connect with people from other teams using their chat address.

  .m-add-contact__form
    base-spinner(
      v-if="fetching"
      color="#949eb1"
      size="9px"
      border-width="1.5px"
      class="m-add-contact__form-spinner"
    )

    span(
      v-else-if="isVerified"
      class="m-add-contact__form-identity u-ellipsis"
    )
      base-avatar(
        :jid="identity.jid"
        size="26px"
        shadow="none"
        class="m-add-contact__form-identity-avatar"
      )

      | {{ identity.name }}

    form-field(
      v-model="contact.jid"
      @submit="onConfirm"
      class="m-add-contact__form-field"
      placeholder="Enter contact address…"
      type="email"
      name="address"
      size="large"
      align="left"
      submittable
      autofocus
    )

  div(
    v-if="hasIdentity"
    :class=`[
      "m-add-contact__notice",
      {
        "m-add-contact__notice--verified": isVerified,
        "m-add-contact__notice--unknown": !isVerified
      }
    ]`
  )
    p.m-add-contact__notice-line
      span.m-add-contact__notice-aside
        base-icon(
          :name="noticeIcon"
          size="14px"
          class="m-add-contact__notice-icon"
        )

      span.m-add-contact__notice-label
        template(
          v-if="isVerified"
        )
          | This is already a chat address, a contact request will be sent.

        template(
          v-else
        )
          | This chat address might not exist, an email invite will be sent.

    p.m-add-contact__notice-line
      span.m-add-contact__notice-aside

      span.m-add-contact__notice-label
        | Once the user accepts your request, you will be able to chat and call.
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// ENUMERATIONS
export enum Mode {
  // Member mode.
  Member = "member",
  // Other mode.
  Other = "other"
}

export default {
  name: "AddContact",

  props: {
    mode: {
      type: String as PropType<Mode>,
      required: true
    }
  },

  emits: ["close", "add"],

  data() {
    return {
      // --> STATE <--

      contact: {
        jid: ""
      },

      identity: {
        name: "",
        jid: null as JID | null
      },

      fetching: false
    };
  },

  computed: {
    isMember(): boolean {
      return this.mode === Mode.Member;
    },

    hasIdentity(): boolean {
      return this.identity.jid !== null ? true : false;
    },

    isVerified(): boolean {
      return this.hasIdentity === true && this.identity.name ? true : false;
    },

    noticeIcon(): string {
      return this.isVerified === true
        ? "checkmark.circle.fill"
        : "questionmark.circle.fill";
    }
  },

  methods: {
    onConfirm(): void {
      const jid = this.contact.jid ? new JID(this.contact.jid) : null;

      if (!jid) {
        BaseAlert.warning("Address required", "Please enter an address");
      } else {
        const name =
          this.identity.jid && jid.equals(this.identity.jid) === true
            ? this.identity.name
            : "";

        this.$emit("add", jid, name);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-add-contact";

.m-add-contact {
  #{$c}__form {
    margin-block-start: 20px;
    display: flex;
    align-items: center;

    #{$c}__form-identity,
    #{$c}__form-spinner {
      margin-inline-start: 3px;
      margin-inline-end: 14px;
      flex: 0 0 auto;
    }

    #{$c}__form-identity {
      color: $color-text-secondary;
      max-width: 30%;
      display: flex;
      align-items: center;

      #{$c}__form-identity-avatar {
        margin-inline-end: 6px;
      }
    }

    #{$c}__form-field {
      flex: 1;
    }
  }

  #{$c}__notice {
    margin-block-start: 16px;

    #{$c}__notice-line {
      font-size: 13.5px;
      margin-block-end: 2px;
      display: flex;
      align-items: center;

      &:last-child {
        margin-block-end: 0;
      }

      #{$c}__notice-aside {
        min-width: 14px;
        padding-inline-end: 6px;
        flex: 0 0 auto;

        #{$c}__notice-icon {
          display: block;
        }
      }

      #{$c}__notice-label {
        color: $color-text-secondary;
        flex: 1;
      }
    }

    &--verified {
      #{$c}__notice-line {
        &:first-child {
          #{$c}__notice-icon {
            fill: $color-base-green-normal;
          }

          #{$c}__notice-label {
            color: $color-base-green-normal;
          }
        }
      }
    }

    &--unknown {
      #{$c}__notice-line {
        &:first-child {
          #{$c}__notice-icon {
            fill: $color-base-grey-dark;
          }

          #{$c}__notice-label {
            color: $color-base-grey-dark;
          }
        }
      }
    }
  }
}
</style>
