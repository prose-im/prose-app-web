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
  :style="appStyle"
  :class=`[
    "s-app",
    "u-appearance",
    "u-appearance--" + session.appearance,
    {
      "s-app--translucent": runtimeTranslucent
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
// NPM
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: COMPONENTS
import BaseAlert from "@/components/base/BaseAlert.vue";

// PROJECT: STORES
import Store from "@/store";
import { SessionAppearance } from "@/store/tables/session";

// PROJECT: BROKER
import Broker from "@/broker";

// PROJECT: UTILITIES
import {
  default as UtilitiesRuntime,
  translucent as runtimeTranslucent
} from "@/utilities/runtime";

// CONSTANTS
const COLOR_ACCENT_BACKGROUND_DARKEN_RATIO = 0.08; // 8%

export default {
  name: "App",

  data() {
    return {
      // --> DATA <--

      runtimeTranslucent,

      // --> STATE <--

      matchMediaDarkMode: null as MediaQueryList | null,
      hasSystemDarkMode: false
    };
  },

  computed: {
    appStyle(): { [property: string]: string } {
      // Acquire all accent colors (team-wide or default)
      const accentBackground =
          this.account.team.accent.background ||
          this.$styles.colors.defaultAccentBackground,
        accentText =
          this.account.team.accent.text ||
          this.$styles.colors.defaultAccentText;

      // Generate actual style
      return {
        // Accent color (background)
        "--color-accent-background-normal":
          this.$filters.color.hexVar(accentBackground),
        "--color-accent-background-dark": this.$filters.color.darkenVar(
          accentBackground,
          COLOR_ACCENT_BACKGROUND_DARKEN_RATIO
        ),

        // Accent color (text)
        "--color-accent-text": this.$filters.color.hexVar(accentText)
      };
    },

    session(): typeof Store.$session {
      return Store.$session;
    },

    account(): typeof Store.$account {
      return Store.$account;
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
    // Start watching for runtime events
    this.setupListenersRuntime();

    // Start watching for dark mode changes
    this.setupListenerSystemDarkMode();

    // Bind settings appearance theme handler
    Store.$settings
      .events()
      .on("appearance:theme", this.onSettingsAppearanceTheme);
  },

  unmounted() {
    // Stop watching for runtime events
    this.unsetupListenersRuntime();

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

    setupListenersRuntime(): void {
      // Register platform-dependant handlers
      const { focused } = UtilitiesRuntime.registerGlobalHandlers({
        route: this.onRoute,
        open: this.onUrlOpen,
        focus: this.onFocusChange,
        menu: this.onMenuSelect
      });

      // Initialize focused value (trigger an explicit focus change)
      // Notice: this is required, since focus status might have changed from \
      //   last stored one, or default, before those event listeners got bound.
      this.onFocusChange(focused);
    },

    unsetupListenersRuntime(): void {
      UtilitiesRuntime.unregisterGlobalHandlers();
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

    async onRoute(
      name: string,
      params?: { [name: string]: string }
    ): Promise<void> {
      // Navigate to target route
      await this.$router.push({
        name,
        params
      });
    },

    async onUrlOpen(protocol: string, path: string): Promise<void> {
      try {
        switch (protocol) {
          case "xmpp": {
            BaseAlert.info("Opened XMPP URL", path);

            // Open conversation
            await Broker.$room.openConversation([new JID(path)]);

            break;
          }

          default: {
            throw new Error("No URL open handler");
          }
        }
      } catch (error) {
        this.$log.warn(
          `Could not open URL with protocol: ${protocol} and path: ${path}`,
          error
        );

        BaseAlert.warn(`Cannot open ${protocol.toUpperCase()} URL`, path);
      }
    },

    onFocusChange(focused: boolean): void {
      this.session.setVisible(focused);
    },

    async onMenuSelect(menu: string): Promise<void> {
      switch (menu) {
        case "settings":
        case "profile": {
          // Emit event to parent of those popups
          this.session.dispatchRequest("popup", {
            target: menu
          });

          break;
        }

        case "updates": {
          // Check for updates
          await UtilitiesRuntime.requestUpdateCheck();

          break;
        }
      }
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

  // --> BOOLEANS <--

  &--translucent {
    background-color: transparent;
  }
}
</style>
