<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-form-attach
  input.c-inbox-form-attach__input(
    @change.prevent="onInputChange"
    type="file",
    name="attach",
    title="",
    tabindex="-1",
    multiple
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "InboxFormAttach",

  emits: ["file"],

  methods: {
    // --> EVENT LISTENERS <--

    onInputChange(event: InputEvent): void {
      const target = (event.target as HTMLInputElement) || null;

      if (target?.files && target?.files.length > 0) {
        for (const file of target.files) {
          this.$emit("file", file);
        }
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-form-attach";

#{$c} {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;

  #{$c}__input {
    cursor: pointer;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    display: block;
    opacity: 0;
  }
}
</style>
