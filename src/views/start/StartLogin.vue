<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-start-login
  start-server-identity(
    class="c-start-login__identity"
  )

  .c-start-login__box
    start-login-form(
      @submit="onFormSubmit"
      :loading="isFormLoading"
      class="c-start-login__form"
    )

  .c-start-login__background
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: ASSEMBLIES
import StartLoginForm from "/src/assemblies/start/StartLoginForm.vue";

// PROJECT: COMPONENTS
import BaseAlert from "/src/components/base/BaseAlert.vue";
import StartServerIdentity from "/src/components/start/StartServerIdentity.vue";

// PROJECT: BROKER
import BrokerClient from "/src/broker/client";

export default {
  name: "StartLogin",

  components: { StartLoginForm, StartServerIdentity },

  data() {
    return {
      // --> STATES <--

      isFormLoading: false
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    async onFormSubmit(form: object): void {
      if (this.isFormLoading !== true) {
        // Mark as loading
        this.isFormLoading = true;

        // Attempt to authenticate
        try {
          await BrokerClient.authenticate(
            form.jid,
            form.password,
            form.remember
          );

          // Show success alert
          BaseAlert.success("Authenticated", "Accessing your dashboard...");
        } catch (error) {
          // Show error alert
          BaseAlert.error(
            "Cannot authenticate",
            error ? error.message || error.toString() : undefined
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
$c: ".c-start-login";

.c-start-login {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;

  #{$c}__identity {
    position: absolute;
    inset-block-start: 30px;
    inset-inline-start: 46px;
    z-index: 2;
  }

  #{$c}__box {
    background: rgba($color-white, 0.85);
    border: 1px solid rgba($color-base-purple-light, 0.325);
    backdrop-filter: blur(14px);
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
    }
  }

  #{$c}__background {
    background-image: url("/src/assets/images/views/start/StartLogin/background-wave.svg");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    position: absolute;
    inset: 0;
    z-index: 0;
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: 640px) {
  .c-start-login {
    #{$c}__identity {
      left: 50%;
      transform: translateX(-50%);
    }
  }
}

@media (max-height: 640px) {
  .c-start-login {
    #{$c}__identity {
      display: none;
    }
  }
}
</style>
