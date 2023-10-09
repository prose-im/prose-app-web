<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
div(
  :class=`[
    "c-base-button",
    "c-base-button--" + size,
    "c-base-button--" + tint,
    {
      "c-base-button--reverse": reverse,
      "c-base-button--round": round,
      "c-base-button--disabled": disabled,
      "c-base-button--loading": loading
    }
  ]`
)
  button(
    @click="onInnerClick"
    :type="type"
    :class=`[
      "c-base-button__inner",
      {
        [buttonClass]: buttonClass
      }
    ]`
  )
    template(
      v-if="$slots.custom"
    )
      slot(
        name="custom"
      )

    template(
      v-else
    )
      base-icon(
        v-if="icon"
        :name="icon"
        :size="iconSize"
        class="c-base-button__icon"
      )

      div(
        :class=`[
          "c-base-button__label",
          {
            "u-medium": !bolder,
            "u-bold": bolder
          }
        ]`
      )
        slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const AVAILABLE_SIZES: { [size: string]: { icon: string } } = {
  small: {
    icon: "11px"
  },

  "mid-small": {
    icon: "12px"
  },

  medium: {
    icon: "13px"
  },

  "mid-medium": {
    icon: "14px"
  },

  large: {
    icon: "16px"
  },

  "mid-large": {
    icon: "17px"
  },

  "ultra-large": {
    icon: "18px"
  }
};

export default {
  name: "BaseButton",

  props: {
    type: {
      type: String,
      default: "button",

      validator(x: string) {
        return ["button", "submit"].includes(x);
      }
    },

    tint: {
      type: String,
      default: "dark",

      validator(x: string) {
        return ["light", "dark", "red"].includes(x);
      }
    },

    size: {
      type: String,
      default: "large",

      validator(x: string) {
        const sizes = Object.keys(AVAILABLE_SIZES);

        sizes.push("custom");

        return sizes.includes(x);
      }
    },

    icon: {
      type: String,
      default: null
    },

    bolder: {
      type: Boolean,
      default: false
    },

    round: {
      type: Boolean,
      default: false
    },

    reverse: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    loading: {
      type: Boolean,
      default: false
    },

    buttonClass: {
      type: String,
      default: null
    }
  },

  emits: ["click"],

  computed: {
    iconSize() {
      if (this.icon) {
        const sizeProperties = AVAILABLE_SIZES[this.size];

        // Return icon size for button size?
        if (sizeProperties) {
          return sizeProperties.icon;
        }

        // Return fallback size
        return "15px";
      }

      // No icon set (therefore no icon size)
      return null;
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onInnerClick(event: Event): void {
      // Re-emit click event
      this.$emit("click", event);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-button";

// VARIABLES
$color-button-dark-normal: var(--color-base-purple-normal);
$color-button-dark-reverse: var(--color-white);
$color-button-light-normal: var(--color-white);
$color-button-light-reverse: var(--color-black);
$color-button-red-normal: var(--color-base-red-normal);
$color-button-red-reverse: var(--color-white);

$size-small-padding-sides: 10px;
$size-mid-small-padding-sides: 12px;
$size-medium-padding-sides: 14px;
$size-mid-medium-padding-sides: 20px;
$size-large-padding-sides: 24px;
$size-mid-large-padding-sides: 34px;
$size-ultra-large-padding-sides: 44px;

.c-base-button {
  display: inline-block;

  #{$c}__inner {
    border: 1px solid rgba(var(--color-black), 0.5);
    outline: 2px solid transparent;
    text-align: center;
    user-select: none;
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
    border-radius: 10px;
    transition: all 100ms linear;
    transition-property: transform, box-shadow, background-color, border-color;

    &:active {
      transform: translateY(1px);
    }

    &:focus-visible {
      outline-color: rgba(var(--color-base-purple-normal), 0.3);
      outline-offset: 1px;
    }

    #{$c}__icon {
      margin-inline-end: 10px;
      flex: 0 0 auto;
    }

    #{$c}__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
  }

  // --> TINTS <--

  &--dark,
  &--red {
    #{$c}__inner {
      box-shadow: 0 4px 4px 0 rgba($color-button-dark-normal, 0.04),
        inset 0 1px 0 0 rgba(var(--color-white), 0.15);

      #{$c}__icon {
        fill: rgb(var(--color-white));
      }

      #{$c}__label {
        color: rgb(var(--color-white));
      }

      &:active {
        box-shadow: 0 1px 1px 0 rgba($color-button-dark-normal, 0.12);
      }
    }
  }

  &--dark {
    #{$c}__inner {
      background-color: rgb($color-button-dark-normal);

      &:hover {
        background-color: lighten-var($color-button-dark-normal, 6%);
      }

      &:active {
        background-color: lighten-var($color-button-dark-normal, 2%);
      }
    }
  }

  &--light {
    #{$c}__inner {
      background-color: rgb($color-button-light-normal);
      border-color: rgba(var(--color-black), 0.15);

      #{$c}__icon {
        fill: rgb(var(--color-black));
      }

      #{$c}__label {
        color: rgb(var(--color-black));
      }

      &:hover,
      &:active {
        border-color: rgba(var(--color-black), 0.2);
      }
    }
  }

  &--red {
    #{$c}__inner {
      background-color: rgb($color-button-red-normal);

      &:hover {
        background-color: lighten-var($color-button-red-normal, 6%);
      }

      &:active {
        background-color: lighten-var($color-button-red-normal, 2%);
      }
    }
  }

  // --> SIZES <--

  &--small {
    #{$c}__inner {
      font-size: 8.5px;
      line-height: 20px;
      padding-inline-start: $size-small-padding-sides;
      padding-inline-end: $size-small-padding-sides;
    }
  }

  &--mid-small {
    #{$c}__inner {
      font-size: 9.5px;
      line-height: 22px;
      padding-inline-start: $size-mid-small-padding-sides;
      padding-inline-end: $size-mid-small-padding-sides;
    }
  }

  &--medium {
    #{$c}__inner {
      font-size: 10px;
      line-height: 25px;
      padding-inline-start: $size-medium-padding-sides;
      padding-inline-end: $size-medium-padding-sides;
    }
  }

  &--mid-medium {
    #{$c}__inner {
      font-size: 12px;
      line-height: 32px;
      padding-inline-start: $size-mid-medium-padding-sides;
      padding-inline-end: $size-mid-medium-padding-sides;
    }
  }

  &--large {
    #{$c}__inner {
      font-size: 14px;
      line-height: 42px;
      padding-inline-start: $size-large-padding-sides;
      padding-inline-end: $size-large-padding-sides;
    }
  }

  &--mid-large {
    #{$c}__inner {
      font-size: 15px;
      line-height: 48px;
      padding-inline-start: $size-mid-large-padding-sides;
      padding-inline-end: $size-mid-large-padding-sides;
    }
  }

  &--ultra-large {
    #{$c}__inner {
      font-size: 16px;
      line-height: 58px;
      padding-inline-start: $size-ultra-large-padding-sides;
      padding-inline-end: $size-ultra-large-padding-sides;
    }
  }

  // --> BOOLEANS <--

  &--reverse {
    &#{$c}--dark {
      #{$c}__inner {
        background-color: rgb($color-button-dark-reverse);
        border-color: rgb($color-button-dark-normal);

        #{$c}__icon {
          fill: rgb($color-button-dark-normal);
        }

        #{$c}__label {
          color: rgb($color-button-dark-normal);
        }
      }
    }

    &#{$c}--light {
      #{$c}__inner {
        background-color: rgba($color-button-light-reverse, 0.15);

        #{$c}__icon {
          fill: rgb(var(--color-black));
        }

        #{$c}__label {
          color: rgb(var(--color-black));
        }

        &:hover {
          background-color: rgba($color-button-light-reverse, 0.11);
        }

        &:active {
          background-color: rgba($color-button-light-reverse, 0.125);
        }
      }
    }

    &#{$c}--red {
      #{$c}__inner {
        background-color: rgb($color-button-red-reverse);
        border-color: rgb($color-button-red-normal);

        #{$c}__icon {
          fill: rgb($color-button-red-normal);
        }

        #{$c}__label {
          color: rgb($color-button-red-normal);
        }
      }
    }
  }

  &--round {
    #{$c}__inner {
      border-radius: 100%;
    }
  }

  &--disabled {
    cursor: not-allowed;

    &#{$c}--loading {
      cursor: wait;
    }

    #{$c}__inner {
      pointer-events: none;
      opacity: 0.6;
    }
  }
}
</style>
