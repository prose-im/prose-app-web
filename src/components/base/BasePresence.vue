<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
span(
  :class=`[
    "c-base-presence",
    "c-base-presence--" + size,
    "c-base-presence--" + type,
    "c-base-presence--" + show,
    {
      "c-base-presence--active": active,
      "c-base-presence--available-only": availableOnly
    }
  ]`
)
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import { PropType } from "vue";
import { JID } from "@prose-im/prose-core-client-wasm";

// PROJECT: STORES
import Store from "@/store";

// CONSTANTS
const TYPE_DEFAULT = "available";
const SHOW_DEFAULT = "none";

export default {
  name: "BasePresence",

  props: {
    jid: {
      type: Object as PropType<JID>,
      required: true
    },

    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["small", "medium", "large"].includes(x);
      }
    },

    active: {
      type: Boolean,
      default: false
    },

    availableOnly: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    type(): string {
      return (this.highest.type as string) || TYPE_DEFAULT;
    },

    show(): string {
      return (this.highest.show as string) || SHOW_DEFAULT;
    },

    highest(): ReturnType<typeof Store.$presence.getHighest> {
      return Store.$presence.getHighest(this.jid);
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-presence";

// VARIABLES
$sizes: (
  "small": 8px,
  "medium": 9px,
  "large": 12px
);

$type-shows: (
  "available": (
    "none": $color-base-green-normal,
    "chat": $color-base-green-normal,
    "away": $color-base-orange-normal,
    "xa": $color-base-grey-normal,
    "dnd": $color-base-red-normal
  )
);

.c-base-presence {
  background-color: transparent;
  border: 1px solid $color-base-grey-normal;
  display: inline-block;
  box-sizing: border-box;
  border-radius: 100%;

  // --> SIZES <--

  @each $name, $size in $sizes {
    &--#{$name} {
      width: $size;
      height: $size;
    }
  }

  // --> TYPES + SHOWS <--

  @each $type, $shows in $type-shows {
    &--#{$type} {
      background-color: $color-base-grey-dark;
      border: 0 none;

      @each $show, $color in $shows {
        &#{$c}--#{$show} {
          background-color: $color;
        }
      }

      &#{$c}--active {
        background-color: $color-white;
      }
    }
  }

  // --> BOOLEANS <--

  &--active {
    border-color: $color-white;
  }

  &--available-only {
    &:not(#{$c}--available) {
      display: none;
    }
  }
}
</style>
