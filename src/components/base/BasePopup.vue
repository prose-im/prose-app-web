<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
teleport(
  to="#app"
)
  base-foreground(
    v-hotkey="hotkeys"
    v-bind="$attrs"
    class="c-base-popup"
  )
    div(
      :class=`[
        "c-base-popup__popup",
        "u-animate",
        "u-animate--superfast",
        "u-animate--fade-in-up-small",
        {
          [popupClass]: popupClass
        }
      ]`
    )
      slot
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
export default {
  name: "BasePopup",

  props: {
    popupClass: {
      type: String,
      default: null
    }
  },

  emits: ["confirm", "close"],

  computed: {
    hotkeys(): { [name: string]: () => void } {
      return {
        enter: this.onHotkeyEnter,
        esc: this.onHotkeyEscape
      };
    }
  },

  methods: {
    // --> EVENT LISTENERS <--

    onHotkeyEnter(): void {
      // Confirm popup
      this.$emit("confirm");
    },

    onHotkeyEscape(): void {
      // Close popup
      this.$emit("close");
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".c-base-popup";

#{$c} {
  #{$c}__popup {
    background-color: rgb(var(--color-white));
    border-radius: 7px;
    box-shadow: 0 4px 14px 0 rgba(var(--color-shadow-primary), 0.075);
  }
}
</style>
