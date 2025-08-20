<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.a-start-login-form
  base-prose-logo(
    class="a-start-login-form__logo"
    size="large"
  )

  form.a-start-login-form__inner(
    @submit.prevent="onSubmit"
  )
    form-field(
      v-model="form.jid"
      :disabled="loading"
      :loading="loading"
      class="a-start-login-form__field"
      type="email"
      name="jid"
      placeholder="Enter your Prose address…"
      size="ultra-large"
      autofocus
    )

    form-field(
      v-model="form.password"
      :disabled="loading"
      :loading="loading"
      class="a-start-login-form__field"
      type="password"
      name="password"
      placeholder="Enter your password…"
      size="ultra-large"
    )

    base-button(
      :disabled="loading"
      :loading="loading"
      class="a-start-login-form__button"
      size="ultra-large"
      type="submit"
    )
      | Login to your Prose account

    .a-start-login-form__options
      .a-start-login-form__options-left
        form-checkbox(
          v-model="form.remember"
          :loading="loading"
          name="remember"
          locked
        )
          | Remember me

      .a-start-login-form__options-right
        a.a-start-login-form__options-help(
          @click="onOptionHelpClick"
        )
          | Get Help
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

// INTERFACES
export interface StateForm {
  jid: string;
  password: string;
  remember: true;
}

export default {
  name: "StartLoginForm",

  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["submit"],

  data() {
    return {
      // --> STATES <--

      form: {
        jid: "",
        password: "",
        remember: true
      } as StateForm
    };
  },

  created() {
    // Populate initial values
    this.form.jid = Store.$account.last.jid || "";
  },

  methods: {
    // --> EVENT LISTENERS <--

    async onOptionHelpClick(): Promise<void> {
      const helpUrl = CONFIG.url.proseHelp;

      try {
        await UtilitiesRuntime.requestOpenUrl(helpUrl);
      } catch (error) {
        this.$log.error(`Failed opening help URL: ${helpUrl}`, error);
      }
    },

    onSubmit(): void {
      this.$emit("submit", {
        ...this.form
      });
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".a-start-login-form";

#{$c} {
  width: 100%;
  max-width: 420px;

  #{$c}__logo {
    margin-block: 0;
    margin-inline: auto;
  }

  #{$c}__inner {
    margin-block-start: 48px;

    #{$c}__field,
    #{$c}__button {
      width: 100%;
      display: block;
    }

    #{$c}__field {
      margin-block-end: 10px;
    }

    #{$c}__button {
      margin-block-start: 26px;
    }

    #{$c}__options {
      margin-block-start: 34px;
      padding-block: 0;
      padding-inline: 12px;
      display: flex;
      align-items: center;

      #{$c}__options-left {
        flex: 1;
        padding-inline-end: 6px;
      }

      #{$c}__options-right {
        flex: 0 0 auto;
      }

      #{$c}__options-help {
        color: rgb(var(--color-text-primary));
        font-size: ($font-size-baseline + 1px);

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
