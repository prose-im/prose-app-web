<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-inbox-details-group-identity
  p.c-inbox-details-group-identity__name
    base-icon(
      name="circle.grid.2x2"
      size="13px"
      class="c-inbox-details-group-identity__name-icon"
    )

    span.c-inbox-details-group-identity__name-full.u-bold
      | {{ room.name }}
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { Room } from "@prose-im/prose-sdk-js";
import { PropType } from "vue";

export default {
  name: "InboxDetailsUserIdentity",

  props: {
    room: {
      type: Object as PropType<Room>,
      required: true
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-inbox-details-group-identity";

.c-inbox-details-group-identity {
  #{$c}__name {
    font-size: 14px;
    padding-inline: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    #{$c}__name-icon {
      fill: rgb(var(--color-base-blue-dark));
      margin-inline-end: 6px;
      flex: 0 0 auto;
    }

    #{$c}__name-full {
      color: rgb(var(--color-text-primary));
    }
  }
}
</style>
