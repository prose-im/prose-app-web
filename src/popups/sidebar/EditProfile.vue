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
  @close="onClose"
  class="p-edit-profile"
  popup-class="p-edit-profile__popup"
)
  .p-edit-profile__navigate

  .p-edit-profile__content
    .p-edit-profile__form

    base-popup-actions(
      @confirm="onSave"
      @cancel="onClose"
      confirm-label="Save Profile"
      cancel-label="Cancel"
      class="p-edit-profile__actions"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "EditProfile",

  emits: ["close", "save"],

  methods: {
    // --> EVENT LISTENERS <--

    onSave(): void {
      this.$emit("save");
    },

    onClose(): void {
      this.$emit("close");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".p-edit-profile";

// VARIABLES
$popup-max-width: 720px;
$popup-max-height: 600px;
$popup-padding-sides: 22px;
$popup-padding-top-bottom: $popup-padding-sides;

$popup-width-full-margin-sides: 14px;
$popup-width-full-breakpoint: (
  $popup-max-width + $popup-width-full-margin-sides
);

$popup-height-full-margin-top-bottom: $popup-width-full-margin-sides;
$popup-height-full-breakpoint: (
  $popup-max-height + $popup-height-full-margin-top-bottom
);

.p-edit-profile {
  #{$c}__popup {
    width: 100%;
    height: 100%;
    max-width: $popup-max-width;
    max-height: $popup-max-height;
    overflow: hidden;
    display: flex;
  }

  #{$c}__navigate {
    border-right: 1px solid $color-border-secondary;
    padding-inline: $popup-padding-sides;
    padding-block: $popup-padding-top-bottom;
    overflow: auto;
    width: 220px;
    flex: 0 0 auto;
  }

  #{$c}__content {
    background-color: $color-background-secondary;
    flex: 1;
    display: flex;
    flex-direction: column;

    #{$c}__form,
    #{$c}__actions {
      padding-inline: $popup-padding-sides;
    }

    #{$c}__form {
      padding-block-start: $popup-padding-top-bottom;
      overflow: auto;
      flex: 1;
    }

    #{$c}__actions {
      padding-block: $popup-padding-top-bottom;
      flex: 0 0 auto;
    }
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: $popup-width-full-breakpoint) {
  .p-edit-profile {
    #{$c}__popup {
      width: calc(100% - #{$popup-width-full-margin-sides});
    }
  }
}

@media (max-height: $popup-height-full-breakpoint) {
  .p-edit-profile {
    #{$c}__popup {
      height: calc(100% - #{$popup-height-full-margin-top-bottom});
    }
  }
}
</style>
