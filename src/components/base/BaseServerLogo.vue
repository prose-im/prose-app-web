<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-avatar(
  :jid="jid"
  :name="name"
  :size="size"
  :shadow="shadow"
  class="c-base-server-logo"
  circle
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@prose-im/prose-sdk-js";

export default {
  name: "BaseServerLogo",

  props: {
    jid: {
      type: Object as PropType<JID>,
      default: null
    },

    name: {
      type: String,
      default: null
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
  }
};
</script>
