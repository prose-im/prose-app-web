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
    "c-base-platform-logo",
    "c-base-platform-logo--" + name
  ]`
)
  span.c-base-platform-logo__icon

  p.c-base-platform-logo__label.u-bold
    | {{ platformLabel }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const AVAILABLE_PLATFORMS: { [name: string]: { label: string } } = {
  web: {
    label: "Web"
  },

  macos: {
    label: "macOS"
  },

  ios: {
    label: "iOS"
  },

  windows: {
    label: "Win."
  },

  android: {
    label: "Android"
  },

  linux: {
    label: "Linux"
  }
};

export default {
  name: "BasePlatformLogo",

  props: {
    name: {
      type: String,
      required: true,

      validator(x: string) {
        return Object.keys(AVAILABLE_PLATFORMS).includes(x);
      }
    }
  },

  computed: {
    platformLabel(): string {
      const platformProperties = AVAILABLE_PLATFORMS[this.name];

      // Return label for platform?
      if (platformProperties) {
        return platformProperties.label;
      }

      // Return fallback label (from raw name)
      return this.name;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-platform-logo";

// VARIABLES
$name-logos: ("web", "macos", "ios", "windows", "android", "linux");

#{$c} {
  background-color: rgb(var(--color-white));
  border: 0.5px solid rgb(var(--color-black));
  width: 46px;
  height: 54px;
  border-radius: 4px;

  #{$c}__icon {
    height: 26px;
    margin-block-start: 5px;
    display: block;

    &:before {
      content: "";
      background-repeat: no-repeat;
      background-size: contain;
      height: 100%;
      aspect-ratio: 1;
      margin-inline: auto;
      display: block;
    }
  }

  #{$c}__label {
    font-size: ($font-size-baseline - 3px);
    text-align: center;
    margin-block-start: 5px;
  }

  // --> NAMES <--

  @each $name in $name-logos {
    &--#{$name} {
      #{$c}__icon {
        &:before {
          background-image: url("/images/components/base/BasePlatformLogo/logo-#{$name}.svg");
        }
      }
    }
  }
}
</style>
