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
    v-for="(item, index) in items"
  )
    list-button(
      v-if="item.type === 'button'"
      @click="item.click ? item.click(context) : null"
      @mouseenter="onButtonMouseEnter(item, index)"
      @mouseleave="onButtonMouseLeave(index)"
      :disabled="item.disabled"
      :emphasis="item.emphasis"
      :actionable="!childrenPopoverVisible[index]"
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

      template(
        v-if="item.children"
        v-slot:details
      )
        base-icon(
          name="chevron.right"
          size="8px"
          class="c-base-popover-list__button-arrow"
        )

      template(
        v-if="item.children"
        v-slot:expanded
      )
        base-popover-list(
          v-if="childrenPopoverVisible[index]"
          :items="item.children"
          class="c-base-popover-list__button-popover"
        )

    list-divider(
      v-else-if="item.type === 'divider'"
      class="c-base-popover-list__divider"
    )

    component(
      v-else-if="item.type === 'component'"
      v-bind="item.properties"
      :is="item.target"
      class="c-base-popover-list__component"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// ENUMERATIONS
export enum ItemType {
  // Button item.
  Button = "button",
  // Divider item.
  Divider = "divider",
  // Component item.
  Component = "component"
}

// INTERFACES
export interface Item {
  type: ItemType;
  children?: Array<Item>;
  click?: (_: any) => void;
  emphasis?: boolean;
  disabled?: boolean;
  color?: string;
  label?: string;
  icon?: string;
  properties?: object;
  target?: object;
}

export default {
  name: "BasePopoverList",

  props: {
    items: {
      type: Array,
      required: true,

      validator(x: Array<Item>): boolean {
        return x.length > 0;
      }
    },

    context: {
      type: Object,

      default() {
        return {};
      }
    }
  },

  data() {
    return {
      // --> STATE <--

      childrenPopoverVisible: {} as { [index: number]: boolean }
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onButtonMouseEnter(item: Item, index: number): void {
      if (item.children && item.children.length > 0) {
        this.childrenPopoverVisible[index] = true;
      }
    },

    onButtonMouseLeave(index: number): void {
      if (this.childrenPopoverVisible[index] === true) {
        delete this.childrenPopoverVisible[index];
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

$entry-button-popover-edges-offset: (
  $size-base-popover-border-width +
    $size-base-popover-list-inset-block-edge-offset
);

.c-base-popover-list {
  #{$c}__button {
    padding-inline: $entry-spacing-sides;
    position: relative;

    #{$c}__button-icon {
      min-width: 16px;

      #{$c}__button-icon-inner {
        fill: $color-base-grey-dark;
      }
    }

    #{$c}__button-arrow {
      fill: $color-base-grey-dark;
    }

    #{$c}__button-popover {
      position: absolute;
      inset-inline-start: calc(100% - #{$entry-button-popover-edges-offset});
      inset-block-end: (-1 * $entry-button-popover-edges-offset);
      z-index: 1;
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

  #{$c}__component {
    margin-inline: $entry-spacing-sides;
    margin-block: 4px 10px;
  }
}
</style>
