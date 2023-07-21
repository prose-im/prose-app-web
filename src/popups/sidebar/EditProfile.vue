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
  .p-edit-profile__navigate
    .p-edit-profile__identity
      div(
        :class=`[
          "p-edit-profile__identity-avatar",
          {
            "p-edit-profile__identity-avatar--locked": isPending || avatarFileLoading
          }
        ]`
      )
        base-avatar(
          :jid="selfJID"
          :data="avatarUpdateData"
          size="96px"
          shadow="light"
          class="p-edit-profile__identity-avatar-image"
          square
        )

        span.p-edit-profile__identity-avatar-file
          input.p-edit-profile__identity-avatar-input(
            @change.prevent="onAvatarFileChange",
            :accept="avatarAcceptTypes"
            type="file",
            id="avatar_file",
            tabindex="-1"
          )

        label.p-edit-profile__identity-avatar-edit(
          for="avatar_file"
        )
          span.p-edit-profile__identity-avatar-edit-inner
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
import { JID } from "@xmpp/jid";
import { readAndCompressImage } from "browser-image-resizer";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import EditProfileIdentity from "@/components/popups/sidebar/EditProfileIdentity.vue";
import EditProfileAuthentication from "@/components/popups/sidebar/EditProfileAuthentication.vue";
import EditProfileProfile from "@/components/popups/sidebar/EditProfileProfile.vue";
import EditProfileEncryption from "@/components/popups/sidebar/EditProfileEncryption.vue";

// PROJECT: STORES
import Store from "@/store";
import { ProfileEntry } from "@/store/tables/profile";

// PROJECT: BROKER
import Broker from "@/broker";
import { SaveVCardRequest } from "@/broker/modules/profile";

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
const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"];
const AVATAR_EXTENSIONS = ["JPG", "PNG", "GIF"];

const AVATAR_CONVERT_MIME = "image/jpeg";
const AVATAR_COMPRESS_QUALITY = 0.94;
const AVATAR_SIZE_MAXIMUM = 400;

export default {
  name: "EditProfile",

  emits: ["close"],

  data() {
    return {
      // --> DATA <--

      // TODO: fix this
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
          component: shallowRef(EditProfileIdentity),

          properties: {
            form: {
              nameFirst: { value: "" },
              nameLast: { value: "" },
              email: { value: "" },
              phone: { value: "" }
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
              jobOrganization: { value: "" },
              jobTitle: { value: "" },
              locationCity: { value: "" },
              locationCountry: { value: "" }
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

      avatarFileLoading: false,

      section: "identity",

      avatarUpdateData: null as string | null
    };
  },

  computed: {
    isPending(): boolean {
      return this.fetching || this.saving;
    },

    selfJID(): JID {
      return this.account.getLocalJID();
    },

    avatarAcceptTypes(): string {
      return AVATAR_MIME_TYPES.join(",");
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
          // Show error alert
          BaseAlert.error("Cannot load profile", "Close and try again?");
        } finally {
          this.fetching = false;
        }
      }
    },

    async syncVCard(): Promise<void> {
      // Load profile vCard
      const profile = await Store.$profile.loadProfileVCard(this.selfJID);

      // Apply new profile data to form
      this.vCardDataToForms(profile);
    },

    async readAvatarFile(avatarFile: File): Promise<string> {
      // #1. Read and normalize image
      const avatarBlob = await readAndCompressImage(avatarFile, {
        quality: AVATAR_COMPRESS_QUALITY,
        maxWidth: AVATAR_SIZE_MAXIMUM,
        maxHeight: AVATAR_SIZE_MAXIMUM,
        mimeType: AVATAR_CONVERT_MIME
      });

      // #2. Convert image file blob to Base64
      const avatarData: string | ArrayBuffer | null = await new Promise(
        resolve => {
          const reader = new FileReader();

          reader.readAsDataURL(avatarBlob);

          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
        }
      );

      // #3. Ensure that avatar is defined (and return format is 'string')
      if (avatarData !== null && typeof avatarData === "string") {
        return avatarData;
      }

      throw new Error("Could not load avatar");
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

    // --> EVENT LISTENERS <--

    async onSave(): Promise<void> {
      if (this.fetching !== true && this.saving !== true) {
        this.saving = true;

        // Generate vCard save data
        const vCardData = this.formsToVCardData(
          this.formSections.identity.properties.form,
          this.formSections.profile.properties.form
        );

        try {
          // Save vCard data
          await Broker.$profile.saveVCard(this.selfJID, vCardData);

          // Save avatar data?
          if (this.avatarUpdateData !== null) {
            // TODO: publish new avatar to PEP
          }

          // Save success: close
          this.$emit("close");

          // Show success alert
          BaseAlert.success("Profile saved", "Your profile has been updated");
        } catch (error) {
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
    },

    async onAvatarFileChange(event: InputEvent): Promise<void> {
      // TODO: fix typing error there
      if (
        event.target &&
        event.target.files &&
        event.target.files.length > 0 &&
        this.avatarFileLoading !== true
      ) {
        const avatarFile: File = event.target.files[0];

        if (AVATAR_MIME_TYPES.includes(avatarFile.type) === true) {
          // Mark as loading
          this.avatarFileLoading = true;

          // Acquire avatar data
          try {
            const avatarData = await this.readAvatarFile(avatarFile);

            this.avatarUpdateData = avatarData;

            BaseAlert.info("Avatar changed", "Save your profile to submit it!");
          } catch (error) {
            BaseAlert.warning(
              "Cannot load this file",
              "Image file seems to be empty"
            );
          }

          // Mark as non-loading
          this.avatarFileLoading = false;
        } else {
          BaseAlert.warning(
            "Cannot use this file",
            `Accepted files: ${AVATAR_EXTENSIONS.join(", ")}`
          );
        }
      } else {
        BaseAlert.error("Cannot load avatar", "No file was selected!");
      }
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
        overflow: hidden;
        display: inline-block;
        position: relative;
        border-radius: 12px;

        &:hover {
          #{$c}__identity-avatar-edit {
            #{$c}__identity-avatar-edit-inner {
              visibility: visible;
              opacity: 1;
            }
          }
        }

        &:active {
          #{$c}__identity-avatar-edit {
            #{$c}__identity-avatar-edit-inner {
              #{$c}__identity-avatar-edit-text {
                transform: scale(0.96);
              }
            }
          }
        }

        &--locked {
          pointer-events: none;
        }

        #{$c}__identity-avatar-image {
          position: relative;
          z-index: 1;
        }

        #{$c}__identity-avatar-file {
          overflow: hidden;
          position: absolute;
          inset: 0;
          z-index: -1;

          #{$c}__identity-avatar-input {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            display: block;
            opacity: 0;
          }
        }

        #{$c}__identity-avatar-edit {
          cursor: pointer;
          position: absolute;
          inset: 0;
          z-index: 2;

          #{$c}__identity-avatar-edit-inner {
            background-image: linear-gradient(
              180deg,
              rgba($color-black, 0) 0%,
              rgba($color-black, 0.6) 100%
            );
            padding-block-start: 14px;
            padding-block-end: 10px;
            position: absolute;
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
