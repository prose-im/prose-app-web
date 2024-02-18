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
  @close="onClose"
  :focus="focus"
  :tabindex="tabindex"
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
      :active="item.active"
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
        v-if="item.icon?.name"
        v-slot:icon
      )
        base-icon(
          :name="item.icon.name"
          size="14px"
          class="c-base-popover-list__button-icon-inner"
        )

      template(
        v-else-if="item.icon?.component"
        v-slot:icon
      )
        component(
          v-bind="item.icon.properties"
          :is="item.icon.component"
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
          @close="onChildClose(index)"
          :items="item.children"
          :tabindex="tabindex - 1"
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  click?: (_: any) => void;
  emphasis?: boolean;
  active?: boolean;
  disabled?: boolean;
  color?: string;
  label?: string;
  icon?: ItemIcon;
  properties?: object;
  target?: object;
}

export interface ItemIcon {
  name?: string;
  component?: object;
  properties?: object;
}

// CONSTANTS
const CHILDREN_MAXIMUM_DEPTH = 10;

export default {
  name: "BasePopoverList",

  props: {
    items: {
      type: Array<Item>,
      required: true,

      validator(x: Array<Item>): boolean {
        return x.length > 0;
      }
    },

    context: {
      type: Object,

      default(): object {
        return {};
      }
    },

    focus: {
      type: Boolean,
      default: true
    },

    tabindex: {
      type: Number,
      default: CHILDREN_MAXIMUM_DEPTH,

      validator(x: number) {
        // Make sure that we do not go too deep w/ too many children (honor \
        //   maximum depth, which goes in reverse order from maximum to \
        //   minimum, since lowest 'tabindex' has priority over higher ones)
        return x > 0;
      }
    }
  },

  emits: ["close"],

  data() {
    return {
      // --> STATE <--

      childrenPopoverVisible: {} as { [index: number]: boolean }
    };
  },

  methods: {
    // --> EVENT LISTENERS <--

    onClose(): void {
      const hasOpenChildren = Object.values(
        this.childrenPopoverVisible
      ).includes(true);

      // Only bubble up close event if there are no open children
      if (hasOpenChildren === false) {
        this.$emit("close");
      }
    },

    onChildClose(index: number): void {
      // Hide child?
      if (this.childrenPopoverVisible[index] === true) {
        delete this.childrenPopoverVisible[index];
      }
    },

    onButtonMouseEnter(item: Item, index: number): void {
      if (item.children && item.children.length > 0) {
        this.childrenPopoverVisible[index] = true;
      }
    },

    onButtonMouseLeave(index: number): void {
      // Trigger child close event
      this.onChildClose(index);
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

#{$c} {
  #{$c}__button {
    padding-inline: (
      $entry-spacing-sides - $size-list-button-rounded-margin-inline
    );
    position: relative;

    #{$c}__button-icon {
      min-width: 16px;

      #{$c}__button-icon-inner {
        fill: rgb(var(--color-base-grey-dark));
      }
    }

    #{$c}__button-arrow {
      fill: rgb(var(--color-base-grey-dark));
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
            fill: rgb(var(--color-white));
          }
        }
      }
    }

    &--color-blue {
      #{$c}__button-icon {
        #{$c}__button-icon-inner {
          fill: rgb(var(--color-base-blue-normal));
        }
      }
    }

    &--color-red {
      #{$c}__button-icon {
        #{$c}__button-icon-inner {
          fill: rgb(var(--color-base-red-normal));
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
