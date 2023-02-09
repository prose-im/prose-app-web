<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-popover(
  class="c-base-popover-list"
)
  template(
    v-for="item in items"
  )
    list-button(
      v-if="item.type === 'button'"
      :emphasis="item.emphasis"
      :color="item.color"
      :class=`[
        "c-base-popover-list__button",
        {
          ["c-base-popover-list__button--color-" + item.color]: item.color
        }
      ]`
      size="small"
      icon-class="c-base-popover-list__button-icon"
    )
      template(
        v-slot:default
      )
        | {{ item.label }}

      template(
        v-if="item.icon"
        v-slot:icon
      )
        base-icon(
          v-if="item.icon"
          :name="item.icon"
          size="14px"
          class="c-base-popover-list__button-icon-inner"
        )

    list-divider(
      v-else-if="item.type === 'divider'"
      class="c-base-popover-list__divider"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BasePopoverList",

  props: {
    items: {
      type: Array,
      required: true,

      validator(x: Array): void {
        return x.length > 0;
      }
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-popover-list";

// VARIABLES
$entry-spacing-sides: 14px;

.c-base-popover-list {
  #{$c}__button {
    padding-inline: $entry-spacing-sides;

    #{$c}__button-icon {
      min-width: 16px;

      #{$c}__button-icon-inner {
        fill: $color-base-grey-dark;
      }
    }

    &--color-blue,
    &--color-red {
      &:hover,
      &:active {
        #{$c}__button-icon {
          #{$c}__button-icon-inner {
            fill: $color-white;
          }
        }
      }
    }

    &--color-blue {
      #{$c}__button-icon {
        #{$c}__button-icon-inner {
          fill: $color-base-blue-normal;
        }
      }
    }

    &--color-red {
      #{$c}__button-icon {
        #{$c}__button-icon-inner {
          fill: $color-base-red-normal;
        }
      }
    }
  }

  #{$c}__divider {
    margin-inline: ($entry-spacing-sides - 1px);
  }
}
</style>