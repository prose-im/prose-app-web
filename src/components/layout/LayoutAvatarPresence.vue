<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-layout-avatar-presence
  .c-layout-avatar-presence__avatar
    slot(
      name="avatar"
    )

  div(
    :class=`[
      "c-layout-avatar-presence__presence",
      {
        [presenceClass]: presenceClass
      }
    ]`
  )
    slot(
      name="presence"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "LayoutAvatarPresence",

  props: {
    presenceClass: {
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
$c: ".c-layout-avatar-presence";

.c-layout-avatar-presence {
  line-height: 0;
  display: inline-block;
  position: relative;

  #{$c}__presence {
    background-color: $color-white;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset-block-end: -3px;
    inset-inline-end: -4px;
    border-radius: 100%;
  }
}
</style>
