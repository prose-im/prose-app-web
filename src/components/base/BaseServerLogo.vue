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
    "c-base-server-logo",
    "c-base-server-logo--shadow-" + shadow
  ]`
  :style=`{
    backgroundImage: backgroundImage,
    height: size,
    width: size
  }`
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseServerLogo",

  props: {
    domain: {
      type: String,
      required: true
    },

    size: {
      type: String,
      default: "100px"
    },

    shadow: {
      type: String,
      default: "normal",

      validator(x: string) {
        return ["none", "normal"].includes(x);
      }
    }
  },

  computed: {
    logoImageUrl() {
      // TODO: acquire from cache using provided domain, this is only a \
      //   temporary fixture
      const handle = this.domain.replaceAll(".", "-");

      return [
        "/src/assets/images/components/base/BaseServerLogo",
        `logo-${handle}.png`
      ].join("/");
    },

    backgroundImage() {
      return `url("${this.logoImageUrl}")`;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-server-logo";

.c-base-server-logo {
  background-color: rgb(var(--color-base-grey-light));
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  display: inline-block;
  border-radius: 100%;

  // --> SHADOWS <--

  &--shadow-normal {
    box-shadow: 0 2px 4px 0 rgba(var(--color-black), 0.08);
  }
}
</style>
