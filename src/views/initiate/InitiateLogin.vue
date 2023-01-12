<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-initiate-login
  .c-initiate-login__identity

  .c-initiate-login__box
    initiate-login-form(
      class="c-initiate-login__form"
    )

  .c-initiate-login__background
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: COMPONENTS
import InitiateLoginForm from "/src/assemblies/initiate/InitiateLoginForm.vue";

export default {
  name: "InitiateLogin",

  components: { InitiateLoginForm }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-initiate-login";

.c-initiate-login {
  #{$c}__identity {
    /* TODO: as component please */
  }

  #{$c}__box {
    background: rgba($color-white, 0.85);
    border: 1px solid rgba($color-base-purple-light, 0.325);
    backdrop-filter: blur(14px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 76px 14px;
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;

    #{$c}__form {
      flex: 0 0 auto;
    }
  }

  #{$c}__background {
    background-image: url("/src/assets/images/views/initiate/InitiateLogin/background-wave.svg");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 0;
  }
}
</style>
