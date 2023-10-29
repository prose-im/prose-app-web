<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
span.c-base-spinner
  span(
    :style="spinnerStyle"
    class="c-base-spinner__clip"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseSpinner",

  props: {
    color: {
      type: String,
      default: "#000000"
    },

    size: {
      type: String,
      default: "20px"
    },

    borderWidth: {
      type: String,
      default: "2.5px"
    },

    speed: {
      type: String,
      default: "900ms"
    }
  },

  computed: {
    spinnerStyle(): { [property: string]: string } {
      return {
        height: this.size,
        width: this.size,
        borderColor: `${this.color} ${this.color} transparent`,
        borderWidth: this.borderWidth,
        animation: `rotate ${this.speed} 0s infinite linear`
      };
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-spinner";

.c-base-spinner {
  text-align: center;
  line-height: 0;

  &,
  #{$c}__clip {
    display: inline-block;
  }

  #{$c}__clip {
    background-color: transparent;
    border-style: solid;
    border-radius: 100%;
    animation-fill-mode: both;
  }
}
</style>
