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
      base-icon(
        :name="badgeIcon"
        size="24px"
        class="c-base-alert__badge-icon"
      )

    .c-base-alert__text
      p.c-base-alert__text-title.u-bold
        | {{ title }}

      p.c-base-alert__text-description(
        v-if="description"
      )
        | {{ description }}

    base-action(
      @click="onCloseClick"
      class="c-base-alert__close"
      icon="xmark"
      context="grey"
      size="11px"
      auto-width
      auto-height
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

export enum Visibility {
  // Auto-hide visibility.
  AutoHide = "auto-hide",
  // Sticky visibility.
  Sticky = "sticky"
}

// INTERFACES
interface State {
  level: Level;
  title: string;
  description: string;
  visibility: Visibility;

  timers: {
    show: null | ReturnType<typeof setTimeout>;
    hide: null | ReturnType<typeof setTimeout>;
  };
}

// CONSTANTS
const ALERT_SHOW_AFTER_DELAY = 250; // 250 milliseconds

const ALERT_EXPIRE_HIDE_DELAY_DEFAULT = 6000; // 6 seconds
const ALERT_EXPIRE_HIDE_DELAY_SHORT = 3000; // 3 seconds

const ALERT_VISIBILITY_DEFAULT = Visibility.AutoHide;

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
      visibility: ALERT_VISIBILITY_DEFAULT,

      timers: {
        show: null,
        hide: null
      }
    } as State;
  },

  error(title: string, description?: string, visibility?: Visibility) {
    EventBus.emit("show", {
      level: Level.Error,
      title,
      description,
      visibility
    });
  },

  warning(title: string, description?: string, visibility?: Visibility) {
    EventBus.emit("show", {
      level: Level.Warning,
      title,
      description,
      visibility
    });
  },

  info(title: string, description?: string, visibility?: Visibility) {
    EventBus.emit("show", {
      level: Level.Info,
      title,
      description,
      visibility
    });
  },

  success(title: string, description?: string, visibility?: Visibility) {
    EventBus.emit("show", {
      level: Level.Success,
      title,
      description,
      visibility
    });
  },

  computed: {
    badgeIcon(): string {
      switch (this.level) {
        case "success": {
          return "checkmark.circle.fill";
        }

        case "info": {
          return "info.circle.fill";
        }

        case "warning":
        case "error": {
          return "exclamationmark.circle.fill";
        }

        default: {
          return "questionmark.circle.fill";
        }
      }
    }
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
      description = "",
      visibility = ALERT_VISIBILITY_DEFAULT
    }: {
      level: Level;
      title: string;
      description?: string;
      visibility?: Visibility;
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
        this.visibility = visibility;

        // Schedule later alert hide (as needed)
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

    scheduleHide(shortLived = false, force = false): void {
      // Unschedule any previously-scheduled hide
      this.unscheduleHide();

      // Schedule later hide? (if auto-hide visibility or forced)
      if (force === true || this.visibility === Visibility.AutoHide) {
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
      }
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
      // Re-schedule closure (as it was previously unscheduled, as needed)
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

#{$c} {
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
  z-index: $index-foreground-primary;
  box-shadow: 0 2px 4px 0 rgba(var(--color-shadow-primary), 0.04);
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

    #{$c}__badge-icon {
      fill: rgb(var(--color-base-grey-dark));
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
    position: absolute;
    inset-inline-end: 15px;
  }

  // --> LEVELS <--

  &--error {
    #{$c}__badge {
      background-color: rgba(var(--color-base-red-normal), 0.15);

      #{$c}__badge-icon {
        fill: rgb(var(--color-base-red-normal));
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

      #{$c}__badge-icon {
        fill: rgb(var(--color-base-orange-normal));
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

      #{$c}__badge-icon {
        fill: rgb(var(--color-base-blue-normal));
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

      #{$c}__badge-icon {
        fill: rgb(var(--color-base-green-normal));
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
