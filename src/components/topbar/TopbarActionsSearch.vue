<!--
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
layout-actions(
  class="c-topbar-actions-search"
)
  base-tooltip(
    align="right"
    direction="bottom"
    tooltip="Search"
  )
    base-action(
      icon="magnifyingglass"
      context="grey"
      size="17px"
      disabled
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "TopbarActionsSearch"
};
</script>
