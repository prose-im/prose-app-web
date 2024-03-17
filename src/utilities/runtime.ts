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

import BaseAlert from "@/components/base/BaseAlert.vue";

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
 * RUNTIME
 * ************************************************************************* */

interface ProgressPayload {
  id: number;
  progress: number;
  total: number;
}

type ProgressHandler = (progress: number, total: number) => void;
type FocusHandler = (focus: boolean) => void;

class UtilitiesRuntime {
  private readonly __isBrowser: boolean;
  private readonly __isApp: boolean;
  private __download_progress_handlers: Map<number, ProgressHandler>;
  private __isWindowFocused: boolean;
  private __WindowFocusedCallbacks: Array<FocusHandler>;
  constructor() {
    // Initialize markers
    this.__isBrowser = platform === "web";
    this.__isApp = window.__TAURI__ !== undefined;
    this.__download_progress_handlers = new Map();
    this.__isWindowFocused = true;
    this.__WindowFocusedCallbacks = [];

    if (this.__isApp) {
      tauriAppWindow.listen<ProgressPayload>(
        "download://progress",
        ({ payload }) => {
          const handler = this.__download_progress_handlers.get(payload.id);
          if (handler != null) {
            handler(payload.progress, payload.total);
          }
        }
      );

      tauriAppWindow.listen<string>(
        "scheme-request-received",
        ({ payload }) => {
          BaseAlert.info("opened", payload);
        }
      );
      // unfortunately "visibilitychange" is less precise than Tauri
      // especially if Tauri window is behind another window(s)
      tauriAppWindow.listen<boolean>("window-focused", ({ payload }) => {
        this.__isWindowFocused = payload;
        this.__WindowFocusedCallbacks.forEach(callback =>
          callback(this.__isWindowFocused)
        );
      });
    } else {
      document.addEventListener("visibilitychange", () => {
        this.__isWindowFocused = document.visibilityState === "visible";
        this.__WindowFocusedCallbacks.forEach(callback =>
          callback(this.__isWindowFocused)
        );
      });
    }
  }

  async requestOpenUrl(url: string, target = "_blank"): Promise<void> {
    if (this.__isApp) {
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

  isWindowFocused(): boolean {
    return this.__isWindowFocused;
  }

  registerWindowFocusCallback(callback: FocusHandler): void {
    this.__WindowFocusedCallbacks.push(callback);
  }

  async requestFileDownload(
    url: string,
    filename: string | null = null,
    progressHandler?: ProgressHandler
  ): Promise<void> {
    // Tauri build
    if (this.__isApp) {
      // Request to download file via Tauri API (application build)
      const ids = new Uint32Array(1);
      window.crypto.getRandomValues(ids);
      const id = ids[0];

      if (progressHandler != undefined) {
        this.__download_progress_handlers.set(id, progressHandler);
      }
      await tauriInvoke("plugin:downloader|download_file", {
        id,
        url,
        filename
      });
      this.__download_progress_handlers.delete(id);
    } else {
      // Request to download file via browser APIs (Web build)
      await new FileDownloader({
        url
      });
    }
  }

  async requestNotificationSend(title: string, body: string): Promise<void> {
    // do not send notification if window is focused
    if (this.__isWindowFocused) {
      return;
    }
    if (this.__isApp) {
      // Request to show notification via Tauri API (application build)
      await tauriInvoke("plugin:notifications|send_notification", {
        title,
        body
      });
    } else {
      const hasPermission = await this.requestNotificationPermission();
      if (hasPermission) {
        // Request to show notification via browser APIs (Web build)
        new Notification(title, { body });
      } else {
        logger.warn(
          "Not sending notification since permission is denied:",
          title
        );
      }
    }
  }

  async setBadgeCount(count: number) {
    if (this.__isApp) {
      await tauriInvoke("plugin:notifications|set_badge_count", {
        count
      });
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    // Request to show notification via browser APIs (Web build)
    let hasPermission =
      Notification.permission === NOTIFICATION_PERMISSIONS.granted;
    if (
      !hasPermission &&
      Notification.permission !== NOTIFICATION_PERMISSIONS.denied
    ) {
      hasPermission =
        (await Notification.requestPermission()) ===
        NOTIFICATION_PERMISSIONS.granted;
    }

    return hasPermission;
  }

  async requestUnreadCountUpdate(count: number): Promise<void> {
    if (this.__isApp) {
      // Request to update unread count via Tauri API (application build)
      await tauriInvoke("set_badge_count", { count });
    } else {
      // Request to update unread count via browser APIs (Web build)
      UtilitiesTitle.setUnreadCount(count);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { platform };
export default new UtilitiesRuntime();
