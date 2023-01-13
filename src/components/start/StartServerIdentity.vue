<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-start-server-identity
  .c-start-server-identity__logo

  .c-start-server-identity__text
    .c-start-server-identity__server
      span.c-start-server-identity__server-name.u-bold
        | Crisp

      span.c-start-server-identity__server-domain
        | crisp.chat

    .c-start-server-identity__versions
      span.u-medium
        | Server

      base-space

      | v0.12.1

      base-space

      | +

      base-space.u-medium

      span.u-medium
        | Pod

      base-space

      | v0.1.3
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "StartServerIdentity"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-start-server-identity";

// VARIABLES
$logo-size: 44px;

.c-start-server-identity {
  background: $color-white;
  border: 1px solid rgba($color-black, 0.06);
  padding: 5px;
  padding-right: 30px;
  display: flex;
  align-items: center;
  border-radius: 30px;
  box-sizing: border-box;
  box-shadow: 0 4px 4px 0 rgba($color-black, 0.01);

  #{$c}__logo {
    background-color: $color-base-grey-light;
    background-image: url("/src/assets/images/components/start/StartServerIdentity/logo.png");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    width: $logo-size;
    height: $logo-size;
    margin-right: 12px;
    flex: 0 0 auto;
    border-radius: 100%;
  }

  #{$c}__text {
    color: $color-text-primary;
    flex: 1;

    #{$c}__server {
      margin-top: -2px;

      #{$c}__server-name {
        font-size: 15px;
      }

      #{$c}__server-domain {
        color: $color-text-secondary;
        font-size: 13px;

        &:before {
          content: "";
          background-color: $color-border-primary;
          vertical-align: middle;
          width: 1px;
          height: 11px;
          margin: -1px 8px 0;
          display: inline-block;
        }
      }
    }

    #{$c}__versions {
      font-size: 12.5px;
      margin-top: 7px;
    }
  }
}
</style>
