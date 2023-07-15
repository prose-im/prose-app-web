<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-popup(
  @close="onClose"
  class="p-edit-profile"
  popup-class="p-edit-profile__popup"
)
  .p-edit-profile__navigate
    .p-edit-profile__identity
      div(
        :class=`[
          "p-edit-profile__identity-avatar",
          {
            "p-edit-profile__identity-avatar--locked": saving
          }
        ]`
      )
        base-avatar(
          :jid="selfJID"
          size="96px"
          shadow="light"
          class="p-edit-profile__identity-avatar-image"
          square
        )

        span.p-edit-profile__identity-avatar-edit
          span.p-edit-profile__identity-avatar-edit-text.u-bold
            | Edit

      p.p-edit-profile__identity-name.u-medium
        template(
          v-if="profile.name"
        )
          | {{ profile.name.first }} {{ profile.name.last }}

        template(
          v-else
        )
          | {{ selfJID.local }}

      p.p-edit-profile__identity-address
        | {{ selfJID }}

    base-navigate(
      @navigate="onSectionsNavigate"
      :sections="navigateSections"
      :active-id="section"
      class="p-edit-profile__sections"
    )

  .p-edit-profile__content
    div(
      :class=`[
        "p-edit-profile__form",
        {
          "p-edit-profile__form--locked": saving
        }
      ]`
    )
      component(
        v-if="formSections[section]"
        v-bind="formSections[section].properties"
        :is="formSections[section].component"
        :jid="selfJID"
      )

    .p-edit-profile__actions
      base-spinner(
        v-if="fetching"
        size="10px"
        border-width="1.5px"
        class="p-edit-profile__actions-spinner"
      )

      base-popup-actions(
        @confirm="onSave"
        @cancel="onClose"
        :confirm-disabled="fetching"
        :confirm-loading="saving"
        confirm-label="Save Profile"
        cancel-label="Cancel"
        class="p-edit-profile__actions-controls"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { shallowRef } from "vue";
import { JID } from "@xmpp/jid";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import EditProfileIdentity from "@/components/popups/sidebar/EditProfileIdentity.vue";
import EditProfileAuthentication from "@/components/popups/sidebar/EditProfileAuthentication.vue";
import EditProfileProfile from "@/components/popups/sidebar/EditProfileProfile.vue";
import EditProfileEncryption from "@/components/popups/sidebar/EditProfileEncryption.vue";

// PROJECT: STORES
import Store from "@/store";

export default {
  name: "EditProfile",

  emits: ["close"],

  data() {
    return {
      // --> DATA <--

      navigateSections: [
        {
          id: "identity",
          title: "Identity",
          label: "Name, Phone, Email",
          icon: "mail.fill"
        },

        {
          id: "authentication",
          title: "Authentication",
          label: "Password, MFA",
          icon: "lock.fill"
        },

        {
          id: "profile",
          title: "Profile",
          label: "Job, Location",
          icon: "person.fill"
        },

        {
          id: "encryption",
          title: "Encryption",
          label: "Certificates, Keys",
          icon: "key.fill"
        }
      ] as NavigateSection,

      formSections: {
        identity: {
          component: shallowRef(EditProfileIdentity)
        },

        authentication: {
          component: shallowRef(EditProfileAuthentication)
        },

        profile: {
          component: shallowRef(EditProfileProfile)
        },

        encryption: {
          component: shallowRef(EditProfileEncryption),

          properties: {
            dataTableClass: "p-edit-profile__form-offset-sides"
          }
        }
      },

      // --> STATE <--

      fetching: false,
      saving: false,

      section: "identity"
    };
  },

  computed: {
    selfJID(): JID {
      return this.account.getLocalJID();
    },

    account(): typeof Store.$account {
      return Store.$account;
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.selfJID);
    }
  },

  async mounted() {
    this.sync();
  },

  methods: {
    // --> HELPERS <--

    sync(): void {
      if (this.fetching !== true) {
        this.fetching = true;

        Promise.all([this.syncVCard()])
          .catch(() => {
            // Show error alert
            BaseAlert.error("Cannot load profile", "Close and try again?");

            return Promise.resolve();
          })
          .then(() => {
            this.fetching = false;
          });
      }
    },

    async syncVCard(): Promise<void> {
      // Load profile vCard
      await Store.$profile.loadProfileVCard(this.selfJID);
    },

    // --> EVENT LISTENERS <--

    onSave(): void {
      if (this.fetching !== true && this.saving !== true) {
        this.saving = true;

        // TODO: proceed save here, then close
      }
    },

    onClose(): void {
      this.$emit("close");
    },

    onSectionsNavigate(sectionId: string): void {
      this.section = sectionId;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-edit-profile";

// VARIABLES
$popup-max-width: 760px;
$popup-max-height: 650px;
$popup-padding-inline: 22px;
$popup-padding-block-start: ($popup-padding-inline + 6px);
$popup-padding-block-end: $popup-padding-inline;

$popup-width-full-margin-inline: 14px;
$popup-width-full-breakpoint: (
  $popup-max-width + $popup-width-full-margin-inline
);

$popup-height-full-margin-block: $popup-width-full-margin-inline;
$popup-height-full-breakpoint: (
  $popup-max-height + $popup-height-full-margin-block
);

.p-edit-profile {
  #{$c}__popup {
    width: 100%;
    height: 100%;
    max-width: $popup-max-width;
    max-height: $popup-max-height;
    overflow: hidden;
    display: flex;
  }

  #{$c}__navigate {
    border-right: 1px solid $color-border-secondary;
    padding-inline: 12px;
    padding-block: $popup-padding-block-start $popup-padding-block-end;
    overflow: auto;
    width: 200px;
    flex: 0 0 auto;

    #{$c}__identity {
      text-align: center;

      #{$c}__identity-avatar {
        line-height: 0;
        cursor: pointer;
        overflow: hidden;
        display: inline-block;
        position: relative;
        border-radius: 12px;

        &:hover {
          #{$c}__identity-avatar-edit {
            visibility: visible;
            opacity: 1;
          }
        }

        &:active {
          #{$c}__identity-avatar-edit {
            #{$c}__identity-avatar-edit-text {
              transform: scale(0.96);
            }
          }
        }

        &--locked {
          pointer-events: none;
        }

        #{$c}__identity-avatar-image {
          position: relative;
          z-index: 0;
        }

        #{$c}__identity-avatar-edit {
          background-image: linear-gradient(
            180deg,
            rgba($color-black, 0) 0%,
            rgba($color-black, 0.6) 100%
          );
          padding-block-start: 14px;
          padding-block-end: 10px;
          position: absolute;
          z-index: 1;
          inset-inline: 0;
          inset-block-end: 0;
          visibility: hidden;
          opacity: 0;
          transition: opacity 100ms linear;

          #{$c}__identity-avatar-edit-text {
            color: $color-text-reverse;
            font-size: 12.5px;
            line-height: 14px;
            text-transform: lowercase;
            display: inline-block;
            transition: transform 100ms linear;
          }
        }
      }

      #{$c}__identity-name {
        color: $color-text-primary;
        font-size: 15.5px;
        margin-block-start: 14px;
      }

      #{$c}__identity-address {
        color: $color-text-secondary;
        font-size: 13.5px;
        margin-block-start: 4px;
      }
    }

    #{$c}__sections {
      margin-block-start: 26px;
    }
  }

  #{$c}__content {
    background-color: $color-background-secondary;
    flex: 1;
    display: flex;
    flex-direction: column;

    #{$c}__form,
    #{$c}__actions {
      padding-inline: $popup-padding-inline;
    }

    #{$c}__form {
      padding-block-start: $popup-padding-block-start;
      overflow: auto;
      flex: 1;

      #{$c}__form-offset-sides {
        margin-inline: (-1 * $popup-padding-inline);
      }

      &--locked {
        cursor: not-allowed;

        > * {
          pointer-events: none;
        }
      }
    }

    #{$c}__actions {
      padding-block: $popup-padding-block-end;
      flex: 0 0 auto;
      align-items: center;
      display: flex;

      #{$c}__actions-spinner {
        margin-inline-end: 8px;
        flex: 0 0 auto;
      }

      #{$c}__actions-controls {
        flex: 1;
      }
    }
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: $popup-width-full-breakpoint) {
  .p-edit-profile {
    #{$c}__popup {
      width: calc(100% - #{$popup-width-full-margin-inline});
    }
  }
}

@media (max-height: $popup-height-full-breakpoint) {
  .p-edit-profile {
    #{$c}__popup {
      height: calc(100% - #{$popup-height-full-margin-block});
    }
  }
}
</style>
