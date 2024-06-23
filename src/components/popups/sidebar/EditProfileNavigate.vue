<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.p-edit-profile-navigate
  .p-edit-profile-navigate__identity
    tool-avatar-select(
      @update="onAvatarUpdate"
      :jid="jid"
      :pending="pending"
    )

    p.p-edit-profile-navigate__identity-name.u-medium
      template(
        v-if="profile.name"
      )
        | {{ profile.name.first }} {{ profile.name.last }}

      template(
        v-else
      )
        | {{ selfName }}

    p.p-edit-profile-navigate__identity-address
      | {{ jid }}

  base-navigate(
    @navigate="onSectionsNavigate"
    :sections="sections"
    :active-id="section"
    class="p-edit-profile-navigate__sections"
  )
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
import { Section as NavigateSection } from "@/components/base/BaseNavigate.vue";
import {
  default as ToolAvatarSelect,
  Update as ToolAvatarUpdate
} from "@/components/tool/ToolAvatarSelect.vue";

// PROJECT: STORES
import Store from "@/store";

// TYPES
export type StateAvatarUpdate = ToolAvatarUpdate;

export default {
  name: "EditProfileEncryptionDeviceOther",

  components: { ToolAvatarSelect },

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    sections: {
      type: Array<NavigateSection>,
      required: true,

      validator(x: Array<NavigateSection>): boolean {
        return x.length > 0;
      }
    },

    sectionInitial: {
      type: String,
      default: null
    },

    pending: {
      type: Boolean,
      default: false
    }
  },

  emits: ["navigate", "avatar"],

  data() {
    return {
      // --> STATE <--

      section: this.sectionInitial || null
    };
  },

  computed: {
    selfName(): string {
      return Store.$account.getInformationName();
    },

    profile(): ReturnType<typeof Store.$profile.getProfile> {
      return Store.$profile.getProfile(this.jid);
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onAvatarUpdate(avatarUpdate: ToolAvatarUpdate): void {
      this.$emit("avatar", avatarUpdate);

      BaseAlert.info("Avatar changed", "Save your profile to submit it!");
    },

    onSectionsNavigate(sectionId: string): void {
      this.section = sectionId;

      this.$emit("navigate", sectionId);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-edit-profile-navigate";

#{$c} {
  #{$c}__identity {
    text-align: center;

    #{$c}__identity-name {
      color: rgb(var(--color-text-primary));
      font-size: 15.5px;
      margin-block-start: 14px;
    }

    #{$c}__identity-address {
      color: rgb(var(--color-text-secondary));
      font-size: 13.5px;
      margin-block-start: 4px;
    }
  }

  #{$c}__sections {
    margin-block-start: 26px;
  }
}
</style>
