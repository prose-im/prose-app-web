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

  private __isWindowFocused = true;
  private __windowFocusedCallbacks: Array<RuntimeFocusHandler> = [];

  private __downloadProgressHandlers: Map<number, RuntimeProgressHandler> =
    new Map();

  constructor() {
    // Initialize markers
    this.__isBrowser = platform === "web";
    this.__isApp = !this.__isBrowser && window.__TAURI__ !== undefined;

    // Register listeners
    this.__registerListeners();
  }

  // TODO: call it from somewhere?
  registerWindowFocusCallback(callback: RuntimeFocusHandler): void {
    this.__windowFocusedCallbacks.push(callback);
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
      // TODO: simplify this random number generation
      const ids = new Uint32Array(1);
      window.crypto.getRandomValues(ids);
      const id = ids[0];

      if (progressHandler !== undefined) {
        this.__downloadProgressHandlers.set(id, progressHandler);
      }

      await tauriInvoke("plugin:downloader|download_file", {
        id,
        url,
        filename
      });

      this.__downloadProgressHandlers.delete(id);
    } else {
      // TODO: implement download progress callback here too

      // Request to download file via browser APIs (Web build)
      await new FileDownloader({
        url
      });
    }
  }

  async requestNotificationSend(title: string, body: string): Promise<void> {
    // Skip notification banners if window has focus
    if (this.__isWindowFocused !== true) {
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

  private __registerListeners(): void {
    if (this.__isApp === true) {
      // Register listeners via Tauri API (application build)
      tauriAppWindow.listen<RuntimeProgressPayload>(
        "download:progress",

        ({ payload }) => {
          const progressHandler = this.__downloadProgressHandlers.get(
            payload.id
          );

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
        this.__isWindowFocused = payload;

        this.__windowFocusedCallbacks.forEach(callback =>
          callback(this.__isWindowFocused)
        );
      });
    } else {
      // Register listeners via browser Document API (Web build)
      document.addEventListener("visibilitychange", () => {
        this.__isWindowFocused = document.visibilityState === "visible";

        this.__windowFocusedCallbacks.forEach(callback =>
          callback(this.__isWindowFocused)
        );
      });
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { platform };
export default new UtilitiesRuntime();
