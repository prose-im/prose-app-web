<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-popup-navigate(
  @close="onClose"
  :locked="isPending"
  :content-section="step"
  size="small"
  class="p-account-welcome"
  actions-class="p-account-welcome__actions"
)
  template(
    v-slot:content
  )
    h1.p-account-welcome__title.u-bold
      | 👋

      base-space(
        :repeat="2"
      )

      | Welcome here!

    p.p-account-welcome__notice
      | Let's get you setup before you can chat with your team.

    .p-account-welcome__step
      base-separator(
        direction="horizontal"
        class="p-account-welcome__separator"
      )

      template(
        v-if="step === stepType.Name"
      )
        form-settings-editor(
          :fieldsets="fieldsets.name"
          field-size="large"
        )

      template(
        v-else-if="step === stepType.Avatar"
      )
        form-settings-editor(
          :fieldsets="fieldsets.avatar"
        )

  template(
    v-slot:actions
  )
    base-spinner(
      v-if="isPending"
      size="9px"
      border-width="1px"
      class="p-account-welcome__actions-spinner"
    )

    base-popup-actions(
      @cancel="onCancel"
      @confirm="onConfirm"
      :confirm-disabled="isPending"
      :confirm-loading="saving"
      cancel-label="I'll Do This Later"
      confirm-label="Continue"
      class="p-account-welcome__actions-controls"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { JID, UserProfile } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import {
  default as FormSettingsEditor,
  FieldsetFieldType as FormFieldsetFieldType,
  FieldsetFieldDataInput as FormFieldsetFieldDataInput,
  FieldsetOptionAside as FormFieldsetOptionAside
} from "@/components/form/FormSettingsEditor.vue";
import {
  default as ToolAvatarSelect,
  Update as ToolAvatarUpdate
} from "@/components/tool/ToolAvatarSelect.vue";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import Broker from "@/broker";

// ENUMERATIONS
enum StepType {
  // Start step
  Start = "start",
  // Name step
  Name = "name",
  // Avatar step
  Avatar = "avatar",
  // End step
  End = "end"
}

// CONSTANTS
const STEPS_CHAIN: { [step in StepType]: StepType } = {
  [StepType.Start]: StepType.Name,
  [StepType.Name]: StepType.Avatar,
  [StepType.Avatar]: StepType.End,
  [StepType.End]: StepType.Start
};

export default {
  name: "AccountWelcome",

  components: { FormSettingsEditor },

  emits: ["close"],

  data() {
    return {
      // --> DATA <--

      stepType: StepType,

      // --> STATE <--

      fetching: false,
      saving: false,

      step: STEPS_CHAIN.start,

      userProfile: null as null | UserProfile,
      userAvatarUpdate: null as ToolAvatarUpdate | null,

      form: {
        nameFirst: { inner: "" },
        nameLast: { inner: "" }
      }
    };
  },

  computed: {
    isPending(): boolean {
      return this.fetching || this.saving;
    },

    fieldsets() {
      return {
        name: [
          {
            id: "name",
            title: "What's your name?",

            fields: [
              {
                id: "name_first",
                type: FormFieldsetFieldType.Input,
                label: "First name:",

                data: {
                  value: this.form.nameFirst,
                  placeholder: "Enter your first name…"
                } as FormFieldsetFieldDataInput
              },

              {
                id: "name_last",
                type: FormFieldsetFieldType.Input,
                label: "Last name:",

                data: {
                  value: this.form.nameLast,
                  placeholder: "Enter your last name…"
                } as FormFieldsetFieldDataInput
              }
            ],

            notes: [
              "Your first and last names are visible by everyone in your team. It helps other people identify who they are talking with, so it's important to define your real name. Avoid pseudonyms.",
              "You can change your name name anytime later on, in your profile settings."
            ],

            options: {
              aside: FormFieldsetOptionAside.Fixed
            }
          }
        ],

        avatar: [
          {
            id: "avatar",
            title: "Set your profile picture:",

            parts: [
              {
                id: "select",
                component: ToolAvatarSelect,

                properties: {
                  jid: this.selfJID,
                  pending: this.isPending,
                  size: "144px",
                  block: true
                },

                listeners: {
                  update: this.onAvatarUpdate
                }
              }
            ],

            notes: [
              "Your profile picture is visible by everyone in your team. Make sure to select a picture where you are the only person, at the center of the photo."
            ]
          }
        ]
      };
    },

    selfJID(): JID {
      return this.account.getSelfJID();
    },

    account(): typeof Store.$account {
      return Store.$account;
    }
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
          await this.syncVCard();
        } catch (error) {
          this.$log.error("Failed loading profile (from welcome)", error);
        } finally {
          this.fetching = false;
        }
      }
    },

    async syncVCard(): Promise<void> {
      // Load user profile for JID
      const userProfile =
        (await Broker.$profile.loadUserProfile(this.selfJID)) || null;

      // Store loaded user profile
      this.userProfile = userProfile;

      // Apply new profile data to form
      this.form.nameFirst.inner = userProfile?.firstName || "";
      this.form.nameLast.inner = userProfile?.lastName || "";
    },

    async saveProfile(): Promise<void> {
      switch (this.step) {
        case StepType.Name: {
          // Save profile name
          await this.saveProfileName();

          break;
        }

        case StepType.Avatar: {
          // Save profile avatar
          await this.saveProfileAvatar();

          break;
        }
      }
    },

    async saveProfileName(): Promise<void> {
      // Acquire first name and last name
      const firstName = this.form.nameFirst.inner,
        lastName = this.form.nameLast.inner;

      // Not enough details provided?
      if (!firstName || !lastName) {
        throw new Error("Either first name or last name missing");
      }

      // Acquire loaded profile (or construct new empty profile)
      const profile =
        this.userProfile !== null ? this.userProfile : new UserProfile();

      // Assign new name to user profile
      profile.firstName = firstName;
      profile.lastName = lastName;

      // Save vCard data
      await Broker.$profile.saveUserProfile(this.selfJID, profile);
    },

    async saveProfileAvatar(): Promise<void> {
      // Acquire avatar update state
      const avatarUpdate = this.userAvatarUpdate;

      // Any avatar update set? (save avatar)
      if (avatarUpdate !== null) {
        await Broker.$profile.saveAvatar(this.selfJID, {
          data: {
            binary: avatarUpdate.binary,
            base64: avatarUpdate.base64
          },

          metadata: {
            type: avatarUpdate.type,
            bytes: avatarUpdate.bytes
          }
        });
      }
    },

    goToNextStep(): void {
      const nextStep = STEPS_CHAIN[this.step];

      // Last step reached? (or any next step?)
      if (nextStep === StepType.End) {
        // Trigger close event
        this.onClose();
      } else {
        // Go to next step
        this.step = nextStep;
      }
    },

    // --> EVENT LISTENERS <--

    onAvatarUpdate(avatarUpdate: ToolAvatarUpdate): void {
      this.userAvatarUpdate = avatarUpdate;
    },

    async onConfirm(): Promise<void> {
      if (this.fetching !== true && this.saving !== true) {
        this.saving = true;

        try {
          // Save profile
          await this.saveProfile();

          // Go to next step (if any)
          this.goToNextStep();
        } catch (error) {
          this.$log.error(
            `Failed saving profile (at welcome step: ${this.step})`,
            error
          );

          // Show error alert
          BaseAlert.error(
            "Cannot save profile",
            "Did you fill all information?"
          );
        } finally {
          this.saving = false;
        }
      }
    },

    onCancel(): void {
      // Skip current step
      this.goToNextStep();
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
$c: ".p-account-welcome";

#{$c} {
  #{$c}__title,
  #{$c}__notice {
    text-align: center;
  }

  #{$c}__title {
    color: rgb(var(--color-text-primary));
    font-size: 28px;
    margin-block-start: 12px;
  }

  #{$c}__notice {
    color: rgb(var(--color-text-secondary));
    font-size: 17.5px;
    margin-block-start: 20px;
  }

  #{$c}__separator {
    margin-block: 40px;
  }

  #{$c}__step {
    padding-inline: 20px;
  }

  #{$c}__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    #{$c}__actions-spinner {
      margin-inline-end: 18px;
      flex: 0 0 auto;
    }

    #{$c}__actions-controls {
      flex: 0 1 auto;
    }
  }
}
</style>
