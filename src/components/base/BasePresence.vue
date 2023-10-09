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

// CONSTANTS
const AVAILABILITY_LABELS = {
  [Availability.Available]: "available",
  [Availability.Away]: "away",
  [Availability.Unavailable]: "unavailable",
  [Availability.DoNotDisturb]: "dnd"
};

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
      const availability = Store.$presence.getAvailability(this.jid),
        availabilityLabel = AVAILABILITY_LABELS[availability] || null;

      if (availabilityLabel === null) {
        throw new Error(`Unexpected availability: ${availability}`);
      }

      return availabilityLabel;
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
  "available": var(--color-base-green-normal),
  "away": var(--color-base-orange-normal),
  "unavailable": var(--color-base-grey-normal),
  "dnd": var(--color-base-red-normal)
);

.c-base-presence {
  background-color: transparent;
  border: 1px solid rgb(var(--color-base-grey-normal));
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

  // --> AVAILABILITIES <--

  @each $availability, $color in $availabilities {
    &--#{$availability} {
      background-color: rgb(var(--color-base-grey-dark));
      border: 0 none;

      &#{$c}--#{$availability} {
        background-color: rgb($color);
      }

      &#{$c}--active {
        background-color: rgb(var(--color-white));
      }
    }
  }

  // --> BOOLEANS <--

  &--active {
    border-color: rgb(var(--color-white));
  }

  &--available-only {
    &:not(#{$c}--available) {
      display: none;
    }
  }
}
</style>
