/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { open as tauriOpen } from "@tauri-apps/api/shell";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const platform = CONFIG.platform;

/**************************************************************************
 * RUNTIME
 * ************************************************************************* */

class UtilitiesRuntime {
  private readonly __isBrowser: boolean;
  private readonly __isApp: boolean;

  constructor() {
    // Initialize markers
    this.__isBrowser = platform === "web" ? true : false;
    this.__isApp = !this.__isBrowser;
  }

  async requestOpenUrl(url: string, target = "_blank"): Promise<void> {
    if (this.__isApp === true) {
      // Request to open via Tauri API (application build)
      await tauriOpen(url);
    } else {
      // Request to open via browser Window API (Web build)
      // Important: set the 'noopener' policy so that the origin window \
      //   cannot be accessed at target, which would create a huge \
      //   security hole.
      window.open(url, target, "noopener");
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { platform };
export default new UtilitiesRuntime();
