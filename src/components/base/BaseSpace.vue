<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
span.c-base-space(
  v-html="spacesHtml"
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseSpace",

  props: {
    repeat: {
      type: Number,
      default: 1
    }
  },

  computed: {
    spacesHtml(): string {
      return Array(this.repeat).fill("&nbsp;").join("");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-space";
</style>
