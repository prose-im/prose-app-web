<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
base-popup(
  :class=`[
    "c-layout-popup-navigate",
    "c-layout-popup-navigate--" + size,
    {
      "c-layout-popup-navigate--actions": $slots.actions
    }
  ]`
  popup-class="c-layout-popup-navigate__popup"
)
  div(
    :class=`[
      "c-layout-popup-navigate__navigate",
      {
        [navigateClass]: navigateClass
      }
    ]`
  )
    slot(
      name="navigate"
    )

  .c-layout-popup-navigate__content
    div(
      :class=`[
        "c-layout-popup-navigate__form",
        {
          "c-layout-popup-navigate__form--locked": locked,
          [formClass]: formClass
        }
      ]`
      ref="form"
    )
      slot(
        name="form"
      )

      .c-layout-popup-navigate__actions.c-layout-popup-navigate__actions--mask(
        v-if="$slots.actions"
      )
        slot(
          name="actions"
        )

    div(
      v-if="$slots.actions"
      :class=`[
        "c-layout-popup-navigate__actions",
        "c-layout-popup-navigate__actions--overlay",
        {
          "c-layout-popup-navigate__actions--separated": hasActionsSeparator,
          [actionsClass]: actionsClass
        }
      ]`
    )
      slot(
        name="actions"
      )
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "LayoutPopupNavigate",

  props: {
    size: {
      type: String,
      default: "medium",

      validator(x: string) {
        return ["small", "medium"].includes(x);
      }
    },

    locked: {
      type: Boolean,
      default: false
    },

    navigateClass: {
      type: String,
      default: null
    },

    formClass: {
      type: String,
      default: null
    },

    formSection: {
      type: String,
      default: null
    },

    actionsClass: {
      type: String,
      default: null
    }
  },

  data() {
    return {
      // --> STATE <--

      hasActionsSeparator: false
    };
  },

  watch: {
    formSection: {
      handler() {
        // Refresh actions separator state
        this.$nextTick(this.autoDetectActionsSeparator);
      }
    }
  },

  mounted() {
    // Auto-detect actions separator state
    this.autoDetectActionsSeparator();

    // Watch for popup size changes (which would trigger the actions separator \
    //   to show or hide)
    window.addEventListener("resize", this.onWindowResize);
  },

  unmounted() {
    // Stop watching for popup size changes
    window.removeEventListener("resize", this.onWindowResize);
  },

  methods: {
    // --> HELPERS <--

    autoDetectActionsSeparator(): void {
      const formElement = (this.$refs.form as HTMLElement) || null;

      if (formElement !== null) {
        const isFormScrollable =
          formElement.scrollHeight > formElement.clientHeight ? true : false;

        if (isFormScrollable !== this.hasActionsSeparator) {
          this.hasActionsSeparator = isFormScrollable;
        }
      }
    },

    // --> EVENT LISTENERS <--

    onWindowResize(): void {
      // Refresh actions separator state
      this.autoDetectActionsSeparator();
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-layout-popup-navigate";

// VARIABLES
$popup-padding-inline: $size-layout-popup-navigate-padding-inline;
$popup-padding-block-start: ($popup-padding-inline + 6px);
$popup-padding-block-end: $popup-padding-inline;

$popup-width-full-margin-inline: 14px;
$popup-height-full-margin-block: $popup-width-full-margin-inline;

$popup-max-width-medium: 760px;
$popup-max-height-medium: 660px;
$popup-max-width-small: 640px;
$popup-max-height-small: 540px;

.c-layout-popup-navigate {
  #{$c}__popup {
    width: calc(100% - #{$popup-width-full-margin-inline});
    height: calc(100% - #{$popup-height-full-margin-block});
    overflow: hidden;
    display: flex;
  }

  #{$c}__navigate {
    border-inline-end: 1px solid rgb(var(--color-border-secondary));
    padding-inline: 12px;
    padding-block: $popup-padding-block-start $popup-padding-block-end;
    overflow: auto;
    flex: 0 0 auto;
  }

  #{$c}__content {
    background-color: rgb(var(--color-background-secondary));
    flex: 1;
    position: relative;

    #{$c}__form,
    #{$c}__actions {
      padding-inline: $popup-padding-inline;
    }

    #{$c}__form {
      padding-block-start: $popup-padding-block-start;
      padding-block-end: $popup-padding-block-end;
      overflow: auto;
      position: absolute;
      inset: 0;
      z-index: 1;

      &--locked {
        cursor: not-allowed;

        > * {
          pointer-events: none;
        }
      }
    }

    #{$c}__actions {
      border-block-start: 1px solid transparent;
      padding-block: $popup-padding-block-end;
      transition: border-color 50ms linear;

      &--separated {
        border-block-start-color: rgb(var(--color-border-tertiary));

        &#{$c}__actions--overlay {
          background-color: rgba(var(--color-background-secondary), 0.9);
          backdrop-filter: blur(9px);
        }
      }

      &--mask {
        pointer-events: none;
        visibility: hidden;
      }

      &--overlay {
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        z-index: 2;
      }
    }
  }

  // --> SIZES <--

  &--medium {
    #{$c}__popup {
      max-width: $popup-max-width-medium;
      max-height: $popup-max-height-medium;
    }

    #{$c}__navigate {
      width: 200px;
    }
  }

  &--small {
    #{$c}__popup {
      max-width: $popup-max-width-small;
      max-height: $popup-max-height-small;
    }

    #{$c}__navigate {
      width: 168px;
    }
  }

  // --> BOOLEANS <--

  &--actions {
    #{$c}__content {
      #{$c}__form {
        padding-block-end: ($popup-padding-block-end + 20px);
      }
    }
  }
}
</style>
