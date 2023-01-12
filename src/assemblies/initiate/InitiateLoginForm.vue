<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-initiate-login-form
  base-logo(
    class="c-initiate-login-form__logo"
    size="large"
  )

  form.c-initiate-login-form__inner
    form-field(
      v-model="form.jid"
      class="c-initiate-login-form__field"
      type="email"
      name="jid"
      placeholder="Enter your @crisp.chat address…"
      size="ultra-large"
    )

    form-field(
      v-model="form.password"
      class="c-initiate-login-form__field"
      type="password"
      name="password"
      placeholder="Enter your password…"
      size="ultra-large"
    )

    base-button(
      class="c-initiate-login-form__button"
      size="ultra-large"
      type="submit"
    )
      | Access Prose server dashboard

    .c-initiate-login-form__options
      .c-initiate-login-form__options-left
        form-checkbox(
          v-model="form.remember"
          name="remember"
        )
          | Remember me

      .c-initiate-login-form__options-right
        a.c-initiate-login-form__options-recover
          | Forgot password?
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InitiateLoginForm",

  data() {
    return {
      // --> STATES <--

      form: {
        jid: "",
        password: "",
        remember: false
      }
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-initiate-login-form";

.c-initiate-login-form {
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

        &:hover,
        &:focus {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
