<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "v-start-login",
    "v-start-login--context-" + runtimeContext,
    {
      "v-start-login--translucent": runtimeTranslucent
    }
  ]`
  data-tauri-drag-region
)
  .v-start-login__box
    start-login-form(
      @submit="onFormSubmit"
      :loading="isFormLoading"
      class="v-start-login__form"
    )

  .v-start-login__background
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: ASSEMBLIES
import StartLoginForm, {
  StateForm as FormStateForm
} from "@/assemblies/start/StartLoginForm.vue";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: COMPOSABLES
import { useInterfaceTitle } from "@/composables/interface";
import { useInterfaceDownsize } from "@/composables/interface";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import {
  context as runtimeContext,
  translucent as runtimeTranslucent
} from "@/utilities/runtime";

// CONSTANTS
const INTERFACE_WIDTH = 600;
const INTERFACE_HEIGHT = 620;

export default {
  name: "StartLogin",

  components: { StartLoginForm },

  setup() {
    useInterfaceTitle("Login");
    useInterfaceDownsize(INTERFACE_WIDTH, INTERFACE_HEIGHT);
  },

  data() {
    return {
      // --> DATA <--

      runtimeContext,
      runtimeTranslucent,

      // --> STATES <--

      isFormLoading: false
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    async onFormSubmit(form: FormStateForm): Promise<void> {
      if (this.isFormLoading !== true) {
        // Mark as loading
        this.isFormLoading = true;

        // Attempt to authenticate
        try {
          await Store.$account.login(form.jid, form.password, form.remember);

          // Show success alert
          BaseAlert.success("Authenticated", "Welcome back!");

          // Redirect to dashboard
          this.$router.push({
            name: "app.index"
          });
        } catch (error) {
          // Show error alert
          BaseAlert.error(
            "Cannot authenticate",
            error
              ? (error as Error).message || (error as Error).toString()
              : undefined
          );

          // Mark as not loading anymore
          this.isFormLoading = false;
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-start-login";

#{$c} {
  background-color: rgb(var(--color-background-primary));
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;

  #{$c}__box,
  #{$c}__background {
    pointer-events: none;
  }

  #{$c}__box {
    background-color: rgba(var(--color-white), 0.8);
    border-block: 1px solid rgba(var(--color-base-purple-light), 0.325);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-block: 76px;
    padding-inline: 14px;
    overflow: auto;
    position: relative;
    z-index: 1;

    #{$c}__form {
      flex: 0 0 auto;

      > * {
        pointer-events: initial;
      }
    }
  }

  #{$c}__background {
    background-image: url("/images/views/start/StartLogin/background-wave.svg");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    opacity: 0.7;
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  // --> CONTEXTS <--

  &--context-application {
    #{$c}__box {
      background-color: transparent;
      border-block: 0 none;
      backdrop-filter: none;
    }

    #{$c}__background {
      background-image: none;
    }
  }

  // --> BOOLEANS <--

  &--translucent {
    background-color: rgba(var(--color-background-primary), 0.94);
  }
}
</style>
