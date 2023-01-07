<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-hello
  h1.u-bold
    | {{ message }}

  base-button
    | Click me!
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseHello",

  props: {
    message: {
      type: String,
      required: true
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss" scoped>
$c: ".c-base-hello";

.c-base-hello {
  font-size: 3.2em;
  line-height: 1.1;
  text-align: center;
  margin-top: 2em;
}
</style>
