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
  confirm-label="Edit Status"
  class="m-update-status"
  size="large"
)
  p.u-medium
    | Set a status for others to see:

  .m-update-status__fields
    form-select(
      v-model="status.icon"
      :options="iconOptions"
      :search="false"
      name="icon"
      placeholder="🙂"
      size="large"
      class="m-update-status__icon"
    )

    form-field(
      v-model="status.text"
      placeholder="What is your status?"
      type="text"
      name="status"
      size="large"
      align="left"
      class="m-update-status__text"
      autofocus
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";
import { Option as FormSelectOption } from "@/components/form/FormSelect.vue";

export default {
  name: "UpdateStatus",

  emits: ["close", "update"],

  data() {
    return {
      // --> DATA <--

      iconOptions: [
        // TODO: replace w/ emoji picker

        {
          value: "🥞",
          label: "🥞"
        },

        {
          value: "🍽️",
          label: "🍽️"
        }
      ] as Array<FormSelectOption>,

      // --> STATE <--

      status: {
        icon: "",
        text: ""
      }
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onConfirm(): void {
      if (!this.status.icon) {
        BaseAlert.warning("Icon required", "Pick an icon for your status");
      } else {
        this.$emit("update", this.status.icon, this.status.text || undefined);
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".m-update-status";

.m-update-status {
  #{$c}__fields {
    display: flex;
    align-items: center;

    #{$c}__icon {
      margin-inline-end: 5px;
      flex: 0 0 auto;
    }

    #{$c}__text {
      flex: 1;
    }
  }
}
</style>
