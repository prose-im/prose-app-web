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
  class="p-edit-profile"
  popup-class="p-edit-profile__popup"
)
  edit-profile-navigate(
    @navigate="onNavigate"
    @avatar="onAvatarUpdate"
    :jid="selfJID"
    :sections="navigateSections"
    :section-initial="sectionInitial"
    :pending="isPending"
    class="p-edit-profile__navigate"
  )

  .p-edit-profile__content
    div(
      :class=`[
        "p-edit-profile__form",
        {
          "p-edit-profile__form--locked": isPending
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
        v-if="isPending"
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
import { JID } from "@prose-im/prose-core-client-wasm";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import {
  default as EditProfileNavigate,
  StateAvatarUpdate
} from "@/components/popups/sidebar/EditProfileNavigate.vue";
import EditProfileIdentity from "@/components/popups/sidebar/EditProfileIdentity.vue";
import EditProfileAuthentication from "@/components/popups/sidebar/EditProfileAuthentication.vue";
import EditProfileProfile from "@/components/popups/sidebar/EditProfileProfile.vue";
import EditProfileEncryption from "@/components/popups/sidebar/EditProfileEncryption.vue";

// PROJECT: STORES
import Store from "@/store";
import { ProfileEntry } from "@/store/tables/profile";

// PROJECT: BROKER
import Broker from "@/broker";
import { SaveVCardRequest, SaveAvatarRequest } from "@/broker/modules/profile";

// TYPES
type FormValueString = { inner: string };

// INTERFACES
export interface FormIdentity {
  nameFirst: FormValueString;
  nameLast: FormValueString;
  email: FormValueString;
  phone: FormValueString;
}

export interface FormProfile {
  jobOrganization: FormValueString;
  jobTitle: FormValueString;
  locationCity: FormValueString;
  locationCountry: FormValueString;
}

// CONSTANTS
const SECTION_INITIAL = "identity";

export default {
  name: "EditProfile",

  components: { EditProfileNavigate },

  emits: ["close"],

  data() {
    return {
      // --> DATA <--

      sectionInitial: SECTION_INITIAL,

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
      ] as Array<NavigateSection>,

      formSections: {
        identity: {
          component: shallowRef(EditProfileIdentity),

          properties: {
            form: {
              nameFirst: { inner: "" },
              nameLast: { inner: "" },
              email: { inner: "" },
              phone: { inner: "" }
            } as FormIdentity
          }
        },

        authentication: {
          component: shallowRef(EditProfileAuthentication)
        },

        profile: {
          component: shallowRef(EditProfileProfile),

          properties: {
            form: {
              jobOrganization: { inner: "" },
              jobTitle: { inner: "" },
              locationCity: { inner: "" },
              locationCountry: { inner: "" }
            } as FormProfile
          }
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

      section: SECTION_INITIAL,

      avatarUpdate: null as StateAvatarUpdate | null
    };
  },

  computed: {
    isPending(): boolean {
      return this.fetching || this.saving;
    },

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

  created() {
    // Apply initial vCard data
    this.vCardDataToForms(this.profile);
  },

  async mounted() {
    await this.sync();
  },

  methods: {
    // --> HELPERS <--

    async sync(): Promise<void> {
      if (this.fetching !== true) {
        this.fetching = true;

        try {
          await Promise.all([this.syncVCard()]);
        } catch (error) {
          this.$log.error("Failed loading profile", error);

          // Show error alert
          BaseAlert.error("Cannot load profile", "Close and try again?");
        } finally {
          this.fetching = false;
        }
      }
    },

    async syncVCard(): Promise<void> {
      // Load profile vCard
      const profile = await Store.$profile.loadProfileVCard(
        this.selfJID.bare()
      );

      // Apply new profile data to form
      this.vCardDataToForms(profile);
    },

    vCardDataToForms(profile: ProfileEntry): void {
      const formIdentity = this.formSections.identity.properties.form,
        formProfile = this.formSections.profile.properties.form;

      // Populate identity form
      if (profile.name) {
        formIdentity.nameFirst.inner = profile.name.first;
        formIdentity.nameLast.inner = profile.name.last;
      }

      if (profile.information && profile.information.contact) {
        formIdentity.email.inner = profile.information.contact.email || "";
        formIdentity.phone.inner = profile.information.contact.phone || "";
      }

      // Populate profile form
      if (profile.employment) {
        formProfile.jobOrganization.inner =
          profile.employment.organization || "";
        formProfile.jobTitle.inner = profile.employment.title || "";
      }

      if (profile.information && profile.information.location) {
        formProfile.locationCity.inner =
          profile.information.location.city || "";

        formProfile.locationCountry.inner =
          profile.information.location.country || "";
      }
    },

    formsToVCardData(
      formIdentity: FormIdentity,
      formProfile: FormProfile
    ): SaveVCardRequest {
      const vCardData: SaveVCardRequest = {};

      // Assign data from identity form
      if (formIdentity.nameFirst.inner && formIdentity.nameLast.inner) {
        vCardData.fullName = [
          formIdentity.nameFirst.inner,
          formIdentity.nameLast.inner
        ].join(" ");
      }

      vCardData.firstName = formIdentity.nameFirst.inner || undefined;
      vCardData.lastName = formIdentity.nameLast.inner || undefined;

      vCardData.email = formIdentity.email.inner || undefined;
      vCardData.phone = formIdentity.phone.inner || undefined;

      // Assign data from profile form
      if (formProfile.jobTitle.inner || formProfile.jobOrganization.inner) {
        vCardData.job = {
          title: formProfile.jobTitle.inner || undefined,
          organization: formProfile.jobOrganization.inner || undefined
        };
      }

      if (formProfile.locationCity.inner || formProfile.locationCountry.inner) {
        vCardData.address = {
          city: formProfile.locationCity.inner || undefined,
          country: formProfile.locationCountry.inner || undefined
        };
      }

      return vCardData;
    },

    avatarUpdateToData(avatarUpdate: StateAvatarUpdate): SaveAvatarRequest {
      return {
        data: {
          binary: avatarUpdate.binary,
          base64: avatarUpdate.base64
        },

        metadata: {
          type: avatarUpdate.type,
          bytes: avatarUpdate.bytes
        }
      };
    },

    // --> EVENT LISTENERS <--

    onNavigate(sectionId: string): void {
      this.section = sectionId;
    },

    onAvatarUpdate(avatarUpdate: StateAvatarUpdate): void {
      this.avatarUpdate = avatarUpdate;
    },

    async onSave(): Promise<void> {
      if (this.fetching !== true && this.saving !== true) {
        this.saving = true;

        // Generate vCard save data
        const vCardData = this.formsToVCardData(
          this.formSections.identity.properties.form,
          this.formSections.profile.properties.form
        );

        // Generate avatar save data (might be empty)
        const avatarData =
          this.avatarUpdate !== null
            ? this.avatarUpdateToData(this.avatarUpdate)
            : null;

        try {
          // Save vCard data
          await Broker.$profile.saveVCard(this.selfJID, vCardData);

          // Save avatar data? (if non-empty)
          if (avatarData !== null) {
            await Broker.$profile.saveAvatar(this.selfJID, avatarData);
          }

          // Save success: close
          this.$emit("close");

          // Show success alert
          BaseAlert.success("Profile saved", "Your profile has been updated");
        } catch (error) {
          this.$log.error("Failed saving profile", error);

          // Save error: show failure
          this.saving = false;

          // Show error alert
          BaseAlert.error(
            "Cannot save profile",
            "Check your profile information"
          );
        }
      }
    },

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
