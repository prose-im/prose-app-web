<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-popup(
  @close="$emit('close')"
  class="p-account-settings"
  popup-class="p-account-settings__popup"
)
  | TODO: account settings
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "AccountSettings",

  emits: ["close"]
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-account-settings";

// VARIABLES
$popup-max-width: 600px;
$popup-padding-sides: 16px;

$popup-width-full-margin-sides: 14px;
$popup-width-full-breakpoint: (
  $popup-max-width + (2 * $popup-padding-sides) + $popup-width-full-margin-sides
);

.p-account-settings {
  #{$c}__popup {
    width: 100%;
    max-width: $popup-max-width;
    min-height: 200px;
    padding-inline: $popup-padding-sides;
    padding-block: 20px;
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: $popup-width-full-breakpoint) {
  .p-account-settings {
    #{$c}__popup {
      width: calc(
        100% - #{2 * $popup-padding-sides} - #{$popup-width-full-margin-sides}
      );
      min-width: auto;
    }
  }
}
</style>
