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
  @confirm="$emit('save')"
  class="p-edit-profile"
  popup-class="p-edit-profile__popup"
)
  | TODO: edit profile
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "EditProfile",

  emits: ["close", "save"]
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-edit-profile";

// VARIABLES
$popup-max-width: 720px;
$popup-padding-sides: 16px;

$popup-width-full-margin-sides: 14px;
$popup-width-full-breakpoint: (
  $popup-max-width + (2 * $popup-padding-sides) + $popup-width-full-margin-sides
);

.p-edit-profile {
  #{$c}__popup {
    width: 100%;
    max-width: $popup-max-width;
    min-height: 420px;
    padding-inline: $popup-padding-sides;
    padding-block: 20px;
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: $popup-width-full-breakpoint) {
  .p-edit-profile {
    #{$c}__popup {
      width: calc(
        100% - #{2 * $popup-padding-sides} - #{$popup-width-full-margin-sides}
      );
      min-width: auto;
    }
  }
}
</style>
