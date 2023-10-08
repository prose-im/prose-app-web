<!--
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 -->

<!-- **********************************************************************
     TEMPLATE
     ********************************************************************** -->

<template lang="pug">
#app(
  @contextmenu.prevent
  :class=`[
    "s-app",
    "u-appearance",
    {
      "u-appearance--light": !isDarkMode,
      "u-appearance--dark": isDarkMode
    }
  ]`
)
  base-alert

  router-view
</template>

<!-- **********************************************************************
     SCRIPT
     ********************************************************************** -->

<script lang="ts">
// PROJECT: STORES
import Store from "@/store";

export default {
  name: "App",

  data() {
    return {
      // --> STATE <--

      matchMediaDarkMode: null as MediaQueryList | null,
      hasSystemDarkMode: false
    };
  },

  computed: {
    isDarkMode(): boolean {
      const theme = this.settings.appearance?.theme || "system";

      // Forced dark mode?
      if (theme === "dark") {
        return true;
      }

      // User prefers dark mode?
      if (theme === "system" && this.hasSystemDarkMode === true) {
        return true;
      }

      // Default to light mode
      return false;
    },

    settings(): typeof Store.$settings {
      return Store.$settings;
    }
  },

  created() {
    // Detect if system requests dark mode
    this.initializeSystemDarkMode();
  },

  mounted() {
    // Start watching for dark mode changes
    this.setupListenerSystemDarkMode();
  },

  unmounted() {
    // Stop watching for dark mode changes
    this.unsetupListenerSystemDarkMode();
  },

  methods: {
    // --> HELPERS <--

    initializeSystemDarkMode(): void {
      this.matchMediaDarkMode = window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

      if (this.matchMediaDarkMode !== null) {
        this.onSystemDarkModeChange(this.matchMediaDarkMode);
      }
    },

    setupListenerSystemDarkMode(): void {
      if (this.matchMediaDarkMode !== null) {
        this.matchMediaDarkMode.addEventListener(
          "change",
          this.onSystemDarkModeChange
        );
      }
    },

    unsetupListenerSystemDarkMode(): void {
      if (this.matchMediaDarkMode !== null) {
        this.matchMediaDarkMode.removeEventListener(
          "change",
          this.onSystemDarkModeChange
        );
      }
    },

    // --> EVENT LISTENERS <--

    onSystemDarkModeChange({ matches = false }): void {
      this.hasSystemDarkMode = matches;
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".s-app";

.s-app {
  background-color: $color-background-primary;
  color: $color-black;
  user-select: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  position: absolute;
  inset: 0;
}
</style>
