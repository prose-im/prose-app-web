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
  class="c-layout-popup-navigate"
  popup-class="c-layout-popup-navigate__popup"
)
  div(
    :class=`[
      "c-layout-popup-navigate__navigate",
      {
        [navigateClass]: navigateClass
      }
    ]`
  )
    slot(
      name="navigate"
    )

  .c-layout-popup-navigate__content
    div(
      :class=`[
        "c-layout-popup-navigate__form",
        {
          "c-layout-popup-navigate__form--locked": locked,
          [formClass]: formClass
        }
      ]`
    )
      slot(
        name="form"
      )

    div(
      :class=`[
        "c-layout-popup-navigate__actions",
        {
          [actionsClass]: actionsClass
        }
      ]`
    )
      slot(
        name="actions"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "LayoutPopupNavigate",

  props: {
    locked: {
      type: Boolean,
      default: false
    },

    navigateClass: {
      type: String,
      default: null
    },

    formClass: {
      type: String,
      default: null
    },

    actionsClass: {
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
$c: ".c-layout-popup-navigate";

// VARIABLES
$popup-max-width: 760px;
$popup-max-height: 650px;
$popup-padding-inline: $size-layout-popup-navigate-padding-inline;
$popup-padding-block-start: ($popup-padding-inline + 6px);
$popup-padding-block-end: $popup-padding-inline;

$popup-width-full-margin-inline: 14px;
$popup-width-full-breakpoint: (
  $popup-max-width + $popup-width-full-margin-inline
);

$popup-height-full-margin-block: $popup-width-full-margin-inline;
$popup-height-full-breakpoint: (
  $popup-max-height + $popup-height-full-margin-block
);

.c-layout-popup-navigate {
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
    padding-inline: 12px;
    padding-block: $popup-padding-block-start $popup-padding-block-end;
    overflow: auto;
    width: 200px;
    flex: 0 0 auto;
  }

  #{$c}__content {
    background-color: $color-background-secondary;
    flex: 1;
    display: flex;
    flex-direction: column;

    #{$c}__form,
    #{$c}__actions {
      padding-inline: $popup-padding-inline;
    }

    #{$c}__form {
      padding-block-start: $popup-padding-block-start;
      overflow: auto;
      flex: 1;

      &--locked {
        cursor: not-allowed;

        > * {
          pointer-events: none;
        }
      }
    }

    #{$c}__actions {
      padding-block: $popup-padding-block-end;
      flex: 0 0 auto;
    }
  }
}

// --> MEDIA-QUERIES <--

@media (max-width: $popup-width-full-breakpoint) {
  .c-layout-popup-navigate {
    #{$c}__popup {
      width: calc(100% - #{$popup-width-full-margin-inline});
    }
  }
}

@media (max-height: $popup-height-full-breakpoint) {
  .c-layout-popup-navigate {
    #{$c}__popup {
      height: calc(100% - #{$popup-height-full-margin-block});
    }
  }
}
</style>
