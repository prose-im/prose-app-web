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
      "c-base-presence--hide-offline": hideOffline
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
  [Availability.DoNotDisturb]: "dnd",
  [Availability.Invisible]: "invisible"
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

    hideOffline: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    availabilitySource(): Availability {
      // Acquire availability for JID? (only if JID has any availability)
      // Important: if JID is not found in roster, then its availability will \
      //   not be known, therefore it is important that we at least try to use \
      //   forced availability as a fallback, and only then default to \
      //   'unavailable' if no source contains the availability for the given \
      //   JID.
      if (this.jid !== undefined) {
        const availabilityOrNone = Store.$presence.getAvailabilityOrNone(
          this.jid
        );

        // Availability is definitely set for the given JID, return its value \
        //   as we can trust this availability source.
        if (availabilityOrNone !== undefined) {
          return availabilityOrNone;
        }
      }

      // Acquire forced availability? (if no JID or no availability for JID, \
      //   used as a fallback)
      if (this.availability !== undefined) {
        return this.availability;
      }

      // No availability source found, return default value (unavailable)
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
  "dnd": var(--color-base-red-normal),
  "away": var(--color-base-orange-normal),
  "invisible": var(--color-base-grey-normal),
  "unavailable": var(--color-base-grey-normal)
);

#{$c} {
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
        background-color: rgb(var(--color-accent-text));
      }
    }
  }

  // --> BOOLEANS <--

  &--active {
    border-color: rgb(var(--color-accent-text));
  }

  &--hide-offline {
    &#{$c}--unavailable,
    &#{$c}--invisible {
      display: none;
    }
  }
}
</style>
