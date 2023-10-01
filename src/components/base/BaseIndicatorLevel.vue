<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
ol(
  :class=`[
    "c-base-indicator-level",
    "c-base-indicator-level--" + size,
    "c-base-indicator-level--" + color,
    {
      "c-base-indicator-level--disabled": disabled
    }
  ]`
)
  li(
    v-for="chunk in scale"
    :class=`[
      "c-base-indicator-level__step",
      {
        "c-base-indicator-level__step--active": (chunk <= step)
      }
    ]`
  )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// CONSTANTS
const THRESHOLD_COLOR_ORANGE = 60;
const THRESHOLD_COLOR_RED = 40;

const PERCENT_MAXIMUM = 100;

export default {
  name: "BaseIndicatorLevel",

  props: {
    percent: {
      type: Number,
      required: true
    },

    scale: {
      type: Number,
      default: 8
    },

    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["small", "medium", "large"].includes(x);
      }
    },

    disabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    step(): number {
      return Math.round(
        Math.max(0.0, this.percent / PERCENT_MAXIMUM) * this.scale
      );
    },

    color(): string {
      if (this.percent <= THRESHOLD_COLOR_RED) {
        return "red";
      }

      if (this.percent <= THRESHOLD_COLOR_ORANGE) {
        return "orange";
      }

      return "green";
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-indicator-level";

.c-base-indicator-level {
  display: flex;
  align-items: center;

  #{$c}__step {
    background-color: $color-base-grey-light;
    border: 1px solid $color-border-primary;
    margin-inline-end: 2px;
    flex: 1;
    border-radius: 3px;

    &:last-child {
      margin-inline-end: 0;
    }
  }

  // --> SIZES <--

  &--small {
    #{$c}__step {
      height: 12px;
    }
  }

  &--medium {
    #{$c}__step {
      height: 16px;
    }
  }

  &--large {
    #{$c}__step {
      height: 20px;
    }
  }

  // --> COLORS <--

  &--green {
    #{$c}__step {
      &--active {
        background-color: $color-base-green-normal;
      }
    }
  }

  &--orange {
    #{$c}__step {
      &--active {
        background-color: $color-base-orange-light;
      }
    }
  }

  &--red {
    #{$c}__step {
      &--active {
        background-color: $color-base-red-normal;
      }
    }
  }

  // --> BOOLEANS <--

  &--disabled {
    cursor: not-allowed;

    #{$c}__step {
      opacity: 0.6;
    }
  }
}
</style>
