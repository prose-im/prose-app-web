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
  @dragover.prevent
  @drop.prevent.stop
  :class=`[
    "s-app",
    "u-appearance",
    "u-appearance--" + session.appearance
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
import { SessionAppearance } from "@/store/tables/session";

// PROJECT: UTILITIES
import UtilitiesRuntime from "@/utilities/runtime";

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
    session(): typeof Store.$session {
      return Store.$session;
    },

    settings(): typeof Store.$settings {
      return Store.$settings;
    }
  },

  beforeMount() {
    // Detect if system requests dark mode
    this.initializeSystemDarkMode();
  },

  mounted() {
    // Start watching for focus changes
    this.setupListenerFocusChange();

    // Start watching for dark mode changes
    this.setupListenerSystemDarkMode();

    // Bind settings appearance theme handler
    Store.$settings
      .events()
      .on("appearance:theme", this.onSettingsAppearanceTheme);
  },

  unmounted() {
    // Stop watching for focus changes
    this.unsetupListenerFocusChange();

    // Stop watching for dark mode changes
    this.unsetupListenerSystemDarkMode();

    // Unbind settings appearance theme handler
    Store.$settings
      .events()
      .off("appearance:theme", this.onSettingsAppearanceTheme);
  },

  methods: {
    // --> HELPERS <--

    refreshEffectiveAppearance(): void {
      // Acquire effective appearance
      const theme = this.settings.appearance?.theme || "system";

      // Forced dark mode, or user prefers dark mode?
      if (
        theme === "dark" ||
        (theme === "system" && this.hasSystemDarkMode === true)
      ) {
        // Update appearance to dark in session store
        this.session.setAppearance(SessionAppearance.Dark);
      } else {
        // Update appearance to light in session store
        this.session.setAppearance(SessionAppearance.Light);
      }
    },

    initializeSystemDarkMode(): void {
      this.matchMediaDarkMode = window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

      if (this.matchMediaDarkMode !== null) {
        // Initialize value (trigger an explicit dark mode change)
        this.onSystemDarkModeChange(this.matchMediaDarkMode);
      }
    },

    setupListenerFocusChange(): void {
      // Register platform-dependant focus change handler
      const hasFocus = UtilitiesRuntime.registerFocusHandler(
        this.onFocusChange
      );

      // Initialize value (trigger an explicit focus change)
      // Notice: this is required, since focus status might have changed from \
      //   last stored one, or default, before those event listeners got bound.
      this.onFocusChange(hasFocus);
    },

    unsetupListenerFocusChange(): void {
      UtilitiesRuntime.unregisterFocusHandler();
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

    onFocusChange(focused: boolean): void {
      this.session.setVisible(focused);
    },

    onSystemDarkModeChange({ matches = false }): void {
      this.hasSystemDarkMode = matches;

      // Refresh effective appearance
      this.refreshEffectiveAppearance();
    },

    onSettingsAppearanceTheme(): void {
      // Refresh effective appearance
      this.refreshEffectiveAppearance();
    }
  }
};
</script>

<!-- **********************************************************************
     STYLE
     ********************************************************************** -->

<style lang="scss">
$c: ".s-app";

#{$c} {
  background-color: rgb(var(--color-background-primary));
  color: rgb(var(--color-black));
  user-select: none;
  margin: 0;
  padding: 0;
  overflow: clip;
  display: flex;
  position: absolute;
  inset: 0;
}
</style>
