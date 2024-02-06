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
  base-server-logo(
    class="c-start-server-identity__logo"
    domain="prose.org"
    size="44px"
    shadow="none"
  )

  .c-start-server-identity__text
    .c-start-server-identity__server
      span.c-start-server-identity__server-name.u-bold
        | Prose

      span.c-start-server-identity__server-domain
        | prose.org

    .c-start-server-identity__versions
      span.u-medium
        | App

      base-space

      | v{{ version }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PACKAGE
import * as projectPackage from "@/../package.json";

export default {
  name: "StartServerIdentity",

  data() {
    return {
      // --> STATE <--

      version: projectPackage.version || "0.0.0"
    };
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-start-server-identity";

// VARIABLES
$logo-size: 44px;

#{$c} {
  background: rgb(var(--color-white));
  border: 1px solid rgba(var(--color-black), 0.06);
  padding: 5px;
  padding-inline-end: 30px;
  display: flex;
  align-items: center;
  border-radius: 30px;
  box-sizing: border-box;
  box-shadow: 0 4px 4px 0 rgba(var(--color-shadow-primary), 0.01);

  #{$c}__logo {
    margin-inline-end: 12px;
    flex: 0 0 auto;
  }

  #{$c}__text {
    color: rgb(var(--color-text-primary));
    flex: 1;

    #{$c}__server {
      margin-block-start: -2px;

      #{$c}__server-name {
        font-size: 15px;
      }

      #{$c}__server-domain {
        color: rgb(var(--color-text-secondary));
        font-size: 13px;

        &:before {
          content: "";
          background-color: rgb(var(--color-border-primary));
          vertical-align: middle;
          width: 1px;
          height: 11px;
          margin-block: -1px 0;
          margin-inline: 8px;
          display: inline-block;
        }
      }
    }

    #{$c}__versions {
      font-size: 12.5px;
      margin-block-start: 7px;
    }
  }
}
</style>
