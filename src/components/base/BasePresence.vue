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
    "c-base-presence--" + availabilityValue,
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
      default: undefined
    },

    availability: {
      type: Number as PropType<Availability>,
      default: undefined
    },

    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["tiny", "small", "medium", "large"].includes(x);
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
    availabilitySource(): Availability {
      // Acquire forced availability?
      if (this.availability !== undefined) {
        return this.availability;
      }

      // Acquire availability for JID?
      if (this.jid !== undefined) {
        return Store.$presence.getAvailability(this.jid);
      }

      // Default availability (unavailable)
      return Availability.Unavailable;
    },

    availabilityValue(): string {
      const availabilityLabel =
        AVAILABILITY_LABELS[this.availabilitySource] || null;

      if (availabilityLabel === null) {
        throw new Error(`Unexpected availability: ${this.availabilitySource}`);
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
  "tiny": 6px,
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
