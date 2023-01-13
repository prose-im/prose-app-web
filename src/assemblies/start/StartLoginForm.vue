<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-start-login-form
  base-logo(
    class="c-start-login-form__logo"
    size="large"
  )

  form.c-start-login-form__inner(
    @submit.prevent="onSubmit"
  )
    form-field(
      v-model="form.jid"
      :disabled="loading"
      :loading="loading"
      class="c-start-login-form__field"
      type="email"
      name="jid"
      placeholder="Enter your @crisp.chat address…"
      size="ultra-large"
    )

    form-field(
      v-model="form.password"
      :disabled="loading"
      :loading="loading"
      class="c-start-login-form__field"
      type="password"
      name="password"
      placeholder="Enter your password…"
      size="ultra-large"
    )

    base-button(
      :disabled="loading"
      :loading="loading"
      class="c-start-login-form__button"
      size="ultra-large"
      type="submit"
    )
      | Login to your Prose account

    .c-start-login-form__options
      .c-start-login-form__options-left
        form-checkbox(
          v-model="form.remember"
          :disabled="loading"
          :loading="loading"
          name="remember"
        )
          | Remember me

      .c-start-login-form__options-right
        a.c-start-login-form__options-recover(
          href="#"
        )
          | Forgot password?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
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
      }
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    /**
     * Triggers on form submit
     * @public
     * @return {undefined}
     */
    onSubmit() {
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
$c: ".c-start-login-form";

.c-start-login-form {
  width: 100%;
  max-width: 420px;

  #{$c}__logo {
    margin: 0 auto;
  }

  #{$c}__inner {
    margin-top: 48px;

    #{$c}__field,
    #{$c}__button {
      width: 100%;
      display: block;
    }

    #{$c}__field {
      margin-bottom: 10px;
    }

    #{$c}__button {
      margin-top: 26px;
    }

    #{$c}__options {
      margin-top: 34px;
      padding: 0 12px;
      display: flex;
      align-items: center;

      #{$c}__options-left {
        flex: 1;
        padding-right: 6px;
      }

      #{$c}__options-right {
        flex: 0 0 auto;
      }

      #{$c}__options-recover {
        color: $color-text-primary;
        font-size: 15px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
