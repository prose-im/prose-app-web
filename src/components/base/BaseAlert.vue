<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
transition(
  enter-active-class="u-animate u-animate--fade-in-up-small u-animate--fast"
  leave-active-class="u-animate u-animate--fade-out-down-small u-animate--superfast"
)
  div(
    v-if="title"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave"
    :class=`[
      "c-base-alert",
      "c-base-alert--" + level
    ]`
  )
    span.c-base-alert__badge

    .c-base-alert__text
      p.c-base-alert__text-title.u-bold
        | {{ title }}

      p.c-base-alert__text-description(
        v-if="description"
      )
        | {{ description }}

    a.c-base-alert__close(
      @click="onCloseClick"
    )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// NPM
import mitt, { Handler } from "mitt";

// ENUMERATIONS
enum Level {
  // Error alert level.
  Error = "error",
  // Warning alert level.
  Warning = "warning",
  // Info alert level.
  Info = "info",
  // Success alert level.
  Success = "success"
}

// INTERFACES
interface State {
  level: Level;
  title: string;
  description: string;

  timers: {
    show: null | ReturnType<typeof setTimeout>;
    hide: null | ReturnType<typeof setTimeout>;
  };
}

// CONSTANTS
const ALERT_SHOW_AFTER_DELAY = 250; // 250 milliseconds

const ALERT_EXPIRE_HIDE_DELAY_DEFAULT = 6000; // 6 seconds
const ALERT_EXPIRE_HIDE_DELAY_SHORT = 3000; // 3 seconds

// INSTANCES
const EventBus = mitt();

export default {
  name: "BaseAlert",

  data() {
    return {
      // --> STATE <--

      level: Level.Error,
      title: "",
      description: "",

      timers: {
        show: null,
        hide: null
      }
    } as State;
  },

  error(title: string, description?: string) {
    EventBus.emit("show", {
      level: Level.Error,
      title,
      description
    });
  },

  warning(title: string, description?: string) {
    EventBus.emit("show", {
      level: Level.Warning,
      title,
      description
    });
  },

  info(title: string, description?: string) {
    EventBus.emit("show", {
      level: Level.Info,
      title,
      description
    });
  },

  success(title: string, description?: string) {
    EventBus.emit("show", {
      level: Level.Success,
      title,
      description
    });
  },

  created() {
    // Bind show event
    EventBus.on("show", this.show as Handler);
  },

  beforeUnmount() {
    // Unbind show event
    EventBus.off("show", this.show as Handler);
  },

  methods: {
    show({
      level,
      title,
      description = ""
    }: {
      level: Level;
      title: string;
      description?: string;
    }): void {
      if (!level || !title) {
        throw new Error("No alert level or title provided");
      }

      // Cancel any pending alert show
      this.unscheduleShow();

      // Hide previous alert?
      this.hide();

      // Open alert
      this.timers.show = setTimeout(() => {
        this.timers.show = null;

        // Assign alert data
        this.level = level;
        this.title = title;
        this.description = description;

        // Schedule later alert hide
        this.scheduleHide();
      }, ALERT_SHOW_AFTER_DELAY);
    },

    hide(): void {
      if (this.title) {
        // Unschedule hide
        this.unscheduleHide();

        // Hide alert
        this.title = "";
        this.description = "";
      }
    },

    scheduleHide(shortLived = false): void {
      // Unschedule any previously-scheduled hide
      this.unscheduleHide();

      // Schedule later hide
      this.timers.hide = setTimeout(
        () => {
          this.timers.hide = null;

          // Hide alert
          this.hide();
        },

        shortLived === true
          ? ALERT_EXPIRE_HIDE_DELAY_SHORT
          : ALERT_EXPIRE_HIDE_DELAY_DEFAULT
      );
    },

    unscheduleHide(): void {
      // Clear existing hide timer?
      if (this.timers.hide !== null) {
        clearTimeout(this.timers.hide);

        this.timers.hide = null;
      }
    },

    unscheduleShow(): void {
      // Clear existing show timer?
      if (this.timers.show !== null) {
        clearTimeout(this.timers.show);

        this.timers.show = null;
      }
    },

    // --> EVENT LISTENERS <--

    onMouseOver(): void {
      // Unschedules close
      this.unscheduleHide();
    },

    onMouseLeave(): void {
      // Re-schedule closure (as it was previously unscheduled)
      this.scheduleHide(true);
    },

    onCloseClick(): void {
      // Hide alert
      this.hide();
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-alert";

// VARIABLES
$badge-size: 54px;
$badge-icon-size: 24px;

$close-size: 24px;
$close-icon-size: 12px;

.c-base-alert {
  background: rgba(var(--color-white), 0.95);
  border: 1px solid rgba(var(--color-border-secondary), 0.9);
  padding: 10px;
  padding-inline-end: 80px;
  backdrop-filter: blur(9px);
  display: flex;
  align-items: center;
  position: absolute;
  inset-block-end: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  box-shadow: 0 2px 4px 0 rgba(var(--color-black), 0.04);
  border-radius: 16px;

  #{$c}__badge {
    background-color: rgba(var(--color-base-grey-dark), 0.15);
    width: $badge-size;
    height: $badge-size;
    margin-inline-end: 24px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;

    &:after {
      @include mask-position(center);
      @include mask-size(cover);
      @include mask-repeat(no-repeat);

      content: "";
      background-color: rgb(var(--color-base-grey-dark));
      width: $badge-icon-size;
      height: $badge-icon-size;
      flex: 0 0 auto;
    }
  }

  #{$c}__text {
    flex: 1;

    #{$c}__text-title {
      color: rgb(var(--color-text-primary));
      font-size: 17px;
    }

    #{$c}__text-description {
      color: rgb(var(--color-text-primary));
      font-size: 15px;
      margin-block-start: 10px;
    }
  }

  #{$c}__close {
    background-color: transparent;
    width: $close-size;
    height: $close-size;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset-inline-end: 15px;
    border-radius: 5px;

    &:hover {
      background-color: rgb(var(--color-base-grey-light));

      &:after {
        opacity: 0.75;
      }
    }

    &:active {
      background-color: darken-var(var(--color-base-grey-light), 2%);
      transition: background-color 100ms linear;
    }

    &:after {
      content: "";
      background-image: url("@/assets/images/components/base/BaseAlert/close-icon.svg");
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      width: $close-icon-size;
      height: $close-icon-size;
      opacity: 0.4;
      flex: 0 0 auto;
    }
  }

  // --> LEVELS <--

  &--error,
  &--warning {
    #{$c}__badge {
      &:after {
        @include mask-image(
          "@/assets/images/components/base/BaseAlert/badge-icon-exclamation.svg"
        );
      }
    }
  }

  &--error {
    #{$c}__badge {
      background-color: rgba(var(--color-base-red-normal), 0.15);

      &:after {
        background-color: rgb(var(--color-base-red-normal));
      }
    }

    #{$c}__text {
      #{$c}__text-title {
        color: rgb(var(--color-base-red-normal));
      }
    }
  }

  &--warning {
    #{$c}__badge {
      background-color: rgba(var(--color-base-orange-normal), 0.15);

      &:after {
        background-color: rgb(var(--color-base-orange-normal));
      }
    }

    #{$c}__text {
      #{$c}__text-title {
        color: rgb(var(--color-base-orange-normal));
      }
    }
  }

  &--info {
    #{$c}__badge {
      background-color: rgba(var(--color-base-blue-normal), 0.15);

      &:after {
        @include mask-image(
          "@/assets/images/components/base/BaseAlert/badge-icon-information.svg"
        );

        background-color: rgb(var(--color-base-blue-normal));
      }
    }

    #{$c}__text {
      #{$c}__text-title {
        color: rgb(var(--color-base-blue-normal));
      }
    }
  }

  &--success {
    #{$c}__badge {
      background-color: rgba(var(--color-base-green-normal), 0.15);

      &:after {
        @include mask-image(
          "@/assets/images/components/base/BaseAlert/badge-icon-checkmark.svg"
        );

        background-color: rgb(var(--color-base-green-normal));
      }
    }

    #{$c}__text {
      #{$c}__text-title {
        color: rgb(var(--color-base-green-normal));
      }
    }
  }
}
</style>
