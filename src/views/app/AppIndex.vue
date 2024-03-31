<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
.v-app-index(
  data-tauri-drag-region
)
  base-placeholder-image(
    illustration="welcome"
    title="Good to see you"
    description="Get started by inviting your team, joining channels and sparking conversations."
    class="v-app-index__placeholder"
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: STORES
import Store from "@/store";

export default {
  name: "AppIndex",

  mounted() {
    // Clear last inbox room from storage
    Store.$navigation.setInboxLastRoomId(null);
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".v-app-index";

#{$c} {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  #{$c}__placeholder {
    pointer-events: none;
  }
}
</style>
