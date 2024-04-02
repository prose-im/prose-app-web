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
    "c-base-action",
    "c-base-action--" + context,
    {
      "c-base-action--active": active,
      "c-base-action--bordered": bordered,
      "c-base-action--translucent": translucent,
      "c-base-action--disabled": disabled,
      "c-base-action--auto-width": autoWidth,
      "c-base-action--auto-height": autoHeight
    }
  ]`
)
  button.c-base-action__inner(
    @click="onInnerClick"
  )
    span.c-base-action__emoji(
      v-if="emoji"
      v-text="emoji"
      :style=`{
        fontSize: size,
        lineHeight: size
      }`
    )

    base-icon(
      v-else
      :name="icon"
      :size="size"
      :style=`{
        transform: iconTransform
      }`
      class="c-base-action__icon"
    )

    base-icon(
      v-if="dropdown"
      name="chevron.down"
      size="8px"
      class="c-base-action__dropdown"
    )

    slot(
      name="inner"
    )

  slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BaseAction",

  props: {
    icon: {
      type: String,
      required: true
    },

    size: {
      type: String,
      default: "20px"
    },

    context: {
      type: String,
      default: "white",

      validator(x: string) {
        return ["transparent", "white", "grey", "dark"].includes(x);
      }
    },

    rotate: {
      type: String,
      default: null,

      validator(x: string) {
        return ["-90deg", "90deg"].includes(x);
      }
    },

    emoji: {
      type: String,
      default: null
    },

    dropdown: {
      type: Boolean,
      default: false
    },

    translucent: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: false
    },

    bordered: {
      type: Boolean,
      default: false
    },

    disabled: {
      type: Boolean,
      default: false
    },

    autoWidth: {
      type: Boolean,
      default: false
    },

    autoHeight: {
      type: Boolean,
      default: false
    }
  },

  emits: ["click"],

  computed: {
    iconTransform(): string | null {
      if (this.rotate) {
        return `rotate(${this.rotate})`;
      }

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
$c: ".c-base-action";

// VARIABLES
$inner-bordered-box-shadow-sizes: inset 0 -1px 0px 0;

#{$c} {
  display: inline-block;
  position: relative;

  #{$c}__inner {
    background-color: transparent;
    border: 0 none;
    outline: 2px solid transparent;
    user-select: none;
    width: 100%;
    margin: 0;
    padding: 0 $size-base-action-padding-sides;
    min-width: ($size-base-action-height + 2px);
    height: $size-base-action-height;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 5px;
    transition: all 100ms linear;
    transition-property: background-color, box-shadow, transform;

    &:focus-visible {
      outline-color: rgba(var(--color-base-purple-normal), 0.3);
      outline-offset: 1px;
    }

    #{$c}__emoji,
    #{$c}__icon,
    #{$c}__dropdown {
      flex: 0 0 auto;
    }

    #{$c}__dropdown {
      margin-inline-start: 7px;
    }
  }

  // --> BOOLEANS <--

  &--active {
    > #{$c}__inner {
      #{$c}__icon {
        fill: darken-var(var(--color-base-blue-normal), 6%);
      }
    }

    &#{$c}--transparent,
    &#{$c}--white,
    &#{$c}--grey,
    &#{$c}--dark {
      &#{$c}--translucent {
        > #{$c}__inner {
          background-color: rgba(var(--color-background-primary), 0.45);
        }
      }
    }

    &#{$c}--transparent {
      > #{$c}__inner {
        background-color: rgba(var(--color-base-grey-light), 0.25);
      }
    }

    &#{$c}--white {
      > #{$c}__inner {
        background-color: rgb(var(--color-base-grey-light));
      }
    }

    &#{$c}--grey {
      > #{$c}__inner {
        background-color: darken-var(var(--color-base-grey-light), 3%);
      }
    }

    &#{$c}--dark {
      > #{$c}__inner {
        background-color: rgba(var(--color-black), 0.06);
      }
    }
  }

  &--bordered {
    &#{$c}:hover,
    &#{$c}:active {
      &:not(#{$c}--transparent) {
        > #{$c}__inner {
          outline-color: transparent;
        }
      }
    }

    &#{$c}:active {
      > #{$c}__inner {
        transform: translateY(1px);
        box-shadow: none;
      }
    }

    > #{$c}__inner {
      outline: 1px solid rgb(var(--color-border-primary));
    }

    &#{$c}--transparent,
    &#{$c}--white {
      > #{$c}__inner {
        outline-color: rgb(var(--color-border-tertiary));
        box-shadow: $inner-bordered-box-shadow-sizes
          rgb(var(--color-border-secondary));
      }
    }

    &#{$c}--grey {
      > #{$c}__inner {
        outline-color: rgb(var(--color-border-secondary));
        box-shadow: $inner-bordered-box-shadow-sizes
          rgb(var(--color-border-primary));
      }
    }

    &#{$c}--dark {
      > #{$c}__inner {
        outline-color: rgba(var(--color-black), 0.1);
        box-shadow: $inner-bordered-box-shadow-sizes
          rgba(var(--color-black), 0.2);
      }
    }
  }

  &--disabled {
    cursor: not-allowed;

    > #{$c}__inner {
      pointer-events: none;
      opacity: 0.35;
    }
  }

  &--auto-width {
    > #{$c}__inner {
      min-width: auto;
    }
  }

  &--auto-height {
    > #{$c}__inner {
      height: auto;
      padding-block: $size-base-action-padding-sides;
    }
  }

  // --> CONTEXTS <--

  &--transparent,
  &--white,
  &--grey,
  &--dark {
    &#{$c}--translucent {
      > #{$c}__inner {
        &:hover {
          background-color: rgba(var(--color-background-primary), 0.5);
        }

        &:active {
          background-color: rgba(var(--color-background-primary), 0.65);
        }
      }
    }
  }

  &--transparent,
  &--white,
  &--grey {
    #{$c}__icon,
    #{$c}__dropdown {
      fill: rgb(var(--color-base-grey-dark));
    }
  }

  &--transparent {
    > #{$c}__inner {
      &:hover,
      &:active {
        background-color: rgba(var(--color-base-grey-light), 0.5);
      }
    }
  }

  &--white {
    > #{$c}__inner {
      &:hover {
        background-color: darken-var(var(--color-base-grey-light), 1%);
      }

      &:active {
        background-color: darken-var(var(--color-base-grey-light), 4%);
      }
    }
  }

  &--grey {
    > #{$c}__inner {
      &:hover {
        background-color: darken-var(var(--color-base-grey-light), 4%);
      }

      &:active {
        background-color: darken-var(var(--color-base-grey-light), 8%);
      }
    }
  }

  &--dark {
    #{$c}__icon,
    #{$c}__dropdown {
      fill: rgb(var(--color-white));
    }

    > #{$c}__inner {
      &:hover {
        background-color: rgba(var(--color-black), 0.08);
      }

      &:active {
        background-color: rgba(var(--color-black), 0.12);
      }
    }
  }
}
</style>
