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
      "c-base-action--disabled": disabled,
      "c-base-action--auto-width": autoWidth
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
        return ["white", "grey"].includes(x);
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

    active: {
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
    }
  },

  emits: ["click"],

  computed: {
    iconTransform() {
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

.c-base-action {
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
    min-width: 36px;
    height: 34px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-sizing: border-box;
    border-radius: 5px;
    transition: background-color 100ms linear;

    &:focus-visible {
      outline-color: rgba(var(--color-base-purple-normal), 0.3);
      outline-offset: 1px;
    }

    #{$c}__emoji,
    #{$c}__icon,
    #{$c}__dropdown {
      flex: 0 0 auto;
    }

    #{$c}__icon,
    #{$c}__dropdown {
      fill: rgb(var(--color-base-grey-dark));
    }

    #{$c}__dropdown {
      margin-inline-start: 7px;
    }
  }

  // --> BOOLEANS <--

  &--active {
    #{$c}__inner {
      #{$c}__icon {
        fill: darken($color-base-blue-normal, 6%);
      }
    }

    &#{$c}--white {
      #{$c}__inner {
        background-color: rgb(var(--color-base-grey-light));
      }
    }

    &#{$c}--grey {
      #{$c}__inner {
        background-color: darken($color-base-grey-light, 3%);
      }
    }
  }

  &--disabled {
    cursor: not-allowed;

    #{$c}__inner {
      pointer-events: none;
      opacity: 0.35;
    }
  }

  &--auto-width {
    #{$c}__inner {
      min-width: auto;
    }
  }

  // --> CONTEXTS <--

  &--white {
    #{$c}__inner {
      &:hover {
        background-color: darken($color-base-grey-light, 1%);
      }

      &:active {
        background-color: darken($color-base-grey-light, 4%);
      }
    }
  }

  &--grey {
    #{$c}__inner {
      &:hover {
        background-color: darken($color-base-grey-light, 4%);
      }

      &:active {
        background-color: darken($color-base-grey-light, 8%);
      }
    }
  }
}
</style>
