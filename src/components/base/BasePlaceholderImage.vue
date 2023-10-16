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
    "c-base-placeholder-image",
    "c-base-placeholder-image--" + illustration
  ]`
)
  .c-base-placeholder-image__illustration

  h6.c-base-placeholder-image__title.u-bold(
    v-if="title"
  )
    | {{ title }}

  p.c-base-placeholder-image__description(
    v-if="description"
  )
    | {{ description }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BasePlaceholderImage",

  props: {
    illustration: {
      type: String,
      required: true,

      validator(x: string) {
        return ["empty", "goodbye", "welcome"].includes(x);
      }
    },

    title: {
      type: String,
      default: null
    },

    description: {
      type: String,
      default: null
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-placeholder-image";

// VARIABLES
$illustration-max-width: 280px;
$illustration-margin-sides: 20px;

$illustration-images: (
  "empty": 226px,
  "goodbye": 180px,
  "welcome": 196px
);

.c-base-placeholder-image {
  max-width: ($illustration-max-width + (2 * $illustration-margin-sides));
  text-align: center;

  #{$c}__illustration {
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    width: calc(100% - #{(2 * $illustration-margin-sides)});
    margin-inline: $illustration-margin-sides;
    display: inline-block;
  }

  #{$c}__title {
    color: rgb(var(--color-text-primary));
    font-size: 20px;
    margin-block-start: 18px;
  }

  #{$c}__description {
    color: rgb(var(--color-text-secondary));
    font-size: 15.5px;
    line-height: 21px;
    margin-block-start: 12px;
  }

  // --> ILLUSTRATIONS <--

  @each $illustration, $height in $illustration-images {
    &--#{$illustration} {
      #{$c}__illustration {
        background-image: url("@/assets/images/components/base/BasePlaceholderImage/illustration-#{$illustration}.webp");
        height: $height;
      }
    }
  }
}
</style>
