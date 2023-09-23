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
  :locked="isPending"
  class="p-edit-profile"
  navigate-class="p-edit-profile__navigate"
  form-class="p-edit-profile__form"
  actions-class="p-edit-profile__actions"
)
  template(
    v-slot:navigate
  )
    edit-profile-navigate(
      @navigate="onNavigate"
      @avatar="onAvatarUpdate"
      :jid="selfJID"
      :sections="navigateSections"
      :section-initial="sectionInitial"
      :pending="isPending"
    )

  template(
    v-slot:form
  )
    component(
      v-if="formSections[section]"
      v-bind="formSections[section].properties"
      :is="formSections[section].component"
      :jid="selfJID"
    )

  template(
    v-slot:actions
  )
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
import { JID, UserProfile, Job, Address } from "@prose-im/prose-sdk-js";

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
import { SaveAvatarRequest } from "@/broker/modules/profile";

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
      const profile = await Store.$profile.loadUserProfile(this.selfJID);

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

    formsToUserProfile(
      formIdentity: FormIdentity,
      formProfile: FormProfile
    ): UserProfile {
      const profile = new UserProfile();

      // Assign base information
      profile.firstName = formIdentity.nameFirst.inner || undefined;
      profile.lastName = formIdentity.nameLast.inner || undefined;
      profile.email = formIdentity.email.inner || undefined;
      profile.phone = formIdentity.phone.inner || undefined;
      // TODO: profile.url = vCard.url;

      // Assign job
      const job = new Job();

      job.title = formProfile.jobTitle.inner || undefined;
      job.organization = formProfile.jobOrganization.inner || undefined;

      profile.job = job;

      // Assign address
      const address = new Address();

      address.city = formProfile.locationCity.inner || undefined;
      address.country = formProfile.locationCountry.inner || undefined;

      profile.address = address;

      return profile;
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
        const vCardData = this.formsToUserProfile(
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
          await Broker.$profile.saveUserProfile(this.selfJID, vCardData);

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

.p-edit-profile {
  #{$c}__form {
    #{$c}__form-offset-sides {
      margin-inline: (-1 * $size-layout-popup-navigate-padding-inline);
    }
  }

  #{$c}__actions {
    display: flex;
    align-items: center;

    #{$c}__actions-spinner {
      margin-inline-end: 8px;
      flex: 0 0 auto;
    }

    #{$c}__actions-controls {
      flex: 1;
    }
  }
}
</style>
