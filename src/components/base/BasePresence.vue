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
    "c-base-presence--" + availability,
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
import { JID, Availability } from "@prose-im/prose-sdk-js";

// PROJECT: STORES
import Store from "@/store";

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
    availability(): string {
      const availability = Store.$presence.getAvailability(this.jid);

      switch (availability) {
        case Availability.Available:
          return "available";
        case Availability.Away:
          return "away";
        case Availability.Unavailable:
          return "unavailable";
        case Availability.DoNotDisturb:
          return "dnd";
      }
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

$availabilities: (
  "available": $color-base-green-normal,
  "away": $color-base-orange-normal,
  "unavailable": $color-base-grey-normal,
  "dnd": $color-base-red-normal
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

  // --> AVAILABILITY <--

  @each $availability, $color in $availabilities {
    &--#{$availability} {
      background-color: $color-base-grey-dark;
      border: 0 none;

      &#{$c}--#{$availability} {
        background-color: $color;
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
