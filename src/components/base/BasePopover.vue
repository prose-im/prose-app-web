<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.c-base-popover
  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BasePopover"
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-popover";

.c-base-popover {
  background-color: $color-white;
  border: 1px solid darken($color-base-grey-light, 2%);
  min-width: 180px;
  max-width: 360px;
  padding-block: 7px;
  overflow: hidden;
  border-radius: 5px;
  box-shadow: 0 2px 6px 0 rgba($color-black, 0.025);
}
</style>
