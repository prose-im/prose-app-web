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
import {
  isPermissionGranted as tauriIsPermissionGranted,
  requestPermission as tauriRequestPermission,
  sendNotification as tauriSendNotification
} from "@tauri-apps/api/notification";
import FileDownloader from "js-file-downloader";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import UtilitiesFile from "@/utilities/file";
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

  async requestFileDownload(
    url: string,
    name: string | null = null
  ): Promise<void> {
    // Generate download options
    // Notice: attempt to extract file name from URL (if none given)
    const downloadOptions = {
      url,
      filename:
        name || UtilitiesFile.detectAttributesFromUrl(url).name || undefined
    };

    if (this.__isApp === true) {
      // Request to download file via Tauri API (application build)
      await tauriInvoke("download_file", downloadOptions);
    } else {
      // Request to download file via browser APIs (Web build)
      await new FileDownloader(downloadOptions);
    }
  }

  async requestNotificationSend(title: string, body: string): Promise<void> {
    const hasPermission = await this.requestNotificationPermission();

    if (hasPermission === true) {
      if (this.__isApp === true) {
        // Request to show notification via Tauri API (application build)
        tauriSendNotification({
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

  async requestNotificationPermission(): Promise<boolean> {
    let hasPermission = false;

    if (this.__isApp === true) {
      // Request to show notification via Tauri API (application build)
      hasPermission = await tauriIsPermissionGranted();

      if (hasPermission === false) {
        hasPermission =
          (await tauriRequestPermission()) === NOTIFICATION_PERMISSIONS.granted;
      }
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
