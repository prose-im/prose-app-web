<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-overlay(
  class="c-inbox-dropzone"
)
  base-placeholder-image(
    :title="title"
    illustration="file-upload"
    description="Drop file here. You can send multiple files at once."
    class="c-inbox-dropzone__placeholder"
    auto-width
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { Room } from "@prose-im/prose-sdk-js";

export default {
  name: "InboxDropzone",

  props: {
    room: {
      type: Object as PropType<Room>,
      default: undefined
    }
  },

  computed: {
    title(): string {
      let title = "Send file";

      if (this.room) {
        title += ` to ${this.room.name}`;
      }

      return title;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-dropzone";

#{$c} {
  #{$c}__placeholder {
    margin-inline: 20px;
  }
}
</style>
