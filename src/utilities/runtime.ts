/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { invoke as tauriInvoke } from "@tauri-apps/api";
import { open as tauriOpen } from "@tauri-apps/api/shell";
import { appWindow as tauriAppWindow } from "@tauri-apps/api/window";
import FileDownloader from "js-file-downloader";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import UtilitiesTitle from "@/utilities/title";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const platform = CONFIG.platform;

const NOTIFICATION_PERMISSIONS = {
  granted: "granted",
  denied: "denied"
};

/**************************************************************************
 * TYPES
 * ************************************************************************* */

export type RuntimeProgressHandler = (progress: number, total: number) => void;
export type RuntimeFocusHandler = (focused: boolean) => void;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface RuntimeProgressPayload {
  id: number;
  progress: number;
  total: number;
}

/**************************************************************************
 * RUNTIME
 * ************************************************************************* */

class UtilitiesRuntime {
  private readonly __isBrowser: boolean;
  private readonly __isApp: boolean;

  private __states = {
    focused: false
  };

  private __handlers = {
    focus: null as RuntimeFocusHandler | null,
    download: new Map() as Map<number, RuntimeProgressHandler>
  };

  constructor() {
    // Initialize markers
    this.__isBrowser = platform === "web";
    this.__isApp = !this.__isBrowser && window.__TAURI__ !== undefined;

    // Bind listeners
    this.__bindListeners();
  }

  registerFocusHandler(handler: RuntimeFocusHandler): boolean {
    // Register platform-agnostic focus handler
    this.__handlers.focus = handler;

    // Return current value (can be used to synchronize external states)
    return this.__states.focused;
  }

  unregisterFocusHandler(): void {
    // Unregister platform-agnostic focus handler
    this.__handlers.focus = null;
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

  async requestFileDownload(
    url: string,
    filename: string | null = null,
    progressHandler?: RuntimeProgressHandler
  ): Promise<void> {
    if (this.__isApp === true) {
      // Request to download file via Tauri API (application build)
      const id = Date.now();

      if (progressHandler !== undefined) {
        this.__handlers.download.set(id, progressHandler);
      }

      await tauriInvoke("plugin:downloader|download_file", {
        id,
        url,
        filename
      });

      this.__handlers.download.delete(id);
    } else {
      // Request to download file via browser APIs (Web build)
      await new FileDownloader({
        url,

        process: (event: ProgressEvent): undefined => {
          if (
            event.lengthComputable === true &&
            progressHandler !== undefined
          ) {
            progressHandler(event.loaded, event.total);
          }

          return undefined;
        }
      });
    }
  }

  async requestNotificationSend(title: string, body: string): Promise<void> {
    // Skip notification banners if window has focus
    if (this.__states.focused !== true) {
      const hasPermission = await this.requestNotificationPermission();

      if (hasPermission === true) {
        if (this.__isApp === true) {
          // Request to show notification via Tauri API (application build)
          await tauriInvoke("plugin:notifications|send_notification", {
            title,
            body
          });
        } else {
          // Request to show notification via browser APIs (Web build)
          new Notification(title, { body });
        }
      } else {
        logger.warn(
          "Not sending notification since permission is denied:",
          title
        );
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    let hasPermission = false;

    if (this.__isApp === true) {
      // Request to show notification via Tauri API (application build)
      // Notice: permission request is managed at a lower level, therefore \
      //   always consider we have permission here.
      hasPermission = true;
    } else {
      // Request to show notification via browser APIs (Web build)
      hasPermission =
        Notification.permission === NOTIFICATION_PERMISSIONS.granted;

      if (
        hasPermission === false &&
        Notification.permission !== NOTIFICATION_PERMISSIONS.denied
      ) {
        hasPermission =
          (await Notification.requestPermission()) ===
          NOTIFICATION_PERMISSIONS.granted;
      }
    }

    return hasPermission;
  }

  async requestUnreadCountUpdate(count: number): Promise<void> {
    if (this.__isApp === true) {
      // Request to update unread count via Tauri API (application build)
      await tauriInvoke("plugin:notifications|set_badge_count", {
        count
      });
    } else {
      // Request to update unread count via browser APIs (Web build)
      UtilitiesTitle.setUnreadCount(count);
    }
  }

  private __bindListeners(): void {
    if (this.__isApp === true) {
      // Register listeners via Tauri API (application build)
      this.__states.focused = true;

      tauriAppWindow.listen<RuntimeProgressPayload>(
        "download:progress",

        ({ payload }) => {
          const progressHandler = this.__handlers.download.get(payload.id);

          if (progressHandler !== undefined) {
            progressHandler(payload.progress, payload.total);
          }
        }
      );

      tauriAppWindow.listen<string>(
        "url:open",

        ({ payload }) => {
          // TODO: open conversation in Prose
        }
      );

      tauriAppWindow.listen<boolean>("window:focus", ({ payload }) => {
        this.__changeFocusState(payload);
      });
    } else {
      // Register listeners via browser Document API (Web build)
      this.__states.focused =
        document.visibilityState === "visible" ? true : false;

      document.addEventListener("visibilitychange", () => {
        this.__changeFocusState(
          document.visibilityState === "visible" ? true : false
        );
      });
    }
  }

  private __changeFocusState(focused: boolean): void {
    this.__states.focused = focused;

    // Trigger focus handler? (if any)
    if (this.__handlers.focus !== null) {
      this.__handlers.focus(focused);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { platform };
export default new UtilitiesRuntime();
