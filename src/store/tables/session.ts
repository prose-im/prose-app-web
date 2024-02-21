/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import mitt from "mitt";
import { defineStore } from "pinia";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum SessionAppearance {
  // Light appearance.
  Light = "light",
  // Dark appearance.
  Dark = "dark"
}

/**************************************************************************
 * INSTANCES
 * ************************************************************************* */

const EventBus = mitt();

/**************************************************************************
 * TABLE
 * ************************************************************************* */

const $session = defineStore("session", {
  // Important: DO NOT persist this store, as it contains session-related data.
  persist: false,

  state: () => {
    return {
      lastConnectedAt: null as number | null,

      connected: false,
      connecting: false,

      protocol: "",

      appearance: SessionAppearance.Light
    };
  },

  actions: {
    events(): ReturnType<typeof mitt> {
      // Return event bus
      return EventBus;
    },

    setConnected(connected: boolean): void {
      // Update last connected date marker?
      if (connected !== this.connected) {
        // Update value
        this.$patch({
          lastConnectedAt: Date.now()
        });
      }

      this.setGeneric("connected", this.connected, connected);
    },

    setConnecting(connecting: boolean): void {
      this.setGeneric("connecting", this.connecting, connecting);
    },

    setProtocol(protocol = ""): void {
      this.setGeneric("protocol", this.protocol, protocol);
    },

    setAppearance(appearance: SessionAppearance): void {
      this.setGeneric("appearance", this.appearance, appearance);
    },

    setGeneric<ValueType>(
      key: string,
      previousValue: ValueType,
      nextValue: ValueType
    ): void {
      // Check if will change
      const willChange = previousValue !== nextValue ? true : false;

      if (willChange === true) {
        // Update value
        this.$patch({
          [key]: nextValue
        });

        // Broadcast state change
        EventBus.emit(key, nextValue);
      }
    }
  }
});

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { SessionAppearance };
export default $session;
