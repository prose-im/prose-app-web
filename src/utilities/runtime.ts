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
import { emit as tauriEmit, TauriEvent } from "@tauri-apps/api/event";
import { open as tauriOpen } from "@tauri-apps/api/shell";
import {
  appWindow as tauriAppWindow,
  LogicalSize as tauriLogicalSize
} from "@tauri-apps/api/window";
import {
  debug as tauriLogDebug,
  error as tauriLogError,
  info as tauriLogInfo,
  warn as tauriLogWarn
} from "tauri-plugin-log-api";
import FileDownloader from "js-file-downloader";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import UtilitiesTitle from "@/utilities/title";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum RuntimeNotificationAction {
  // Click action.
  Click = "click",
  // Other action.
  Other = "other",
  // None action.
  None = "none"
}

enum RuntimeLogLevel {
  // Debug level.
  Debug = "debug",
  // Info level.
  Info = "info",
  // Warn level.
  Warn = "warn",
  // Error level.
  Error = "error"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type RuntimeProgressHandler = (progress: number, total: number) => void;
type RuntimeFocusHandler = (focused: boolean) => void;
type RuntimeOpenHandler = (protocol: string, path: string) => void;
type RuntimeMenuHandler = (menu: string) => Promise<void>;

type RuntimeRouteHandler = (
  name: string,
  params?: { [name: string]: string }
) => Promise<void>;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface RuntimeProgressPayload {
  id: number;
  progress: number;
  total: number;
}

interface RuntimeNotificationRoute {
  name: string;
  params?: { [name: string]: string };
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const platform = CONFIG.platform;
const context = platform === "web" ? "browser" : "application";
const translucent = platform === "macos";

const NOTIFICATION_PERMISSIONS = {
  granted: "granted",
  denied: "denied"
};

const LOG_METHODS = {
  browser: {
    [RuntimeLogLevel.Debug]: console.debug,
    [RuntimeLogLevel.Info]: console.info,
    [RuntimeLogLevel.Warn]: console.warn,
    [RuntimeLogLevel.Error]: console.error
  },

  application: {
    [RuntimeLogLevel.Debug]: tauriLogDebug,
    [RuntimeLogLevel.Info]: tauriLogInfo,
    [RuntimeLogLevel.Warn]: tauriLogWarn,
    [RuntimeLogLevel.Error]: tauriLogError
  }
};

/**************************************************************************
 * RUNTIME
 * ************************************************************************* */

class UtilitiesRuntime {
  private readonly __isApplication: boolean;

  private __states = {
    focused: false
  };

  private __handlers = {
    focus: null as RuntimeFocusHandler | null,
    route: null as RuntimeRouteHandler | null,
    open: null as RuntimeOpenHandler | null,
    menu: null as RuntimeMenuHandler | null,
    download: new Map() as Map<number, RuntimeProgressHandler>
  };

  constructor() {
    // Initialize markers
    this.__isApplication = context === "application";

    // Bind listeners
    this.__bindListeners();
  }

  registerHandlers({
    route,
    open,
    focus,
    menu
  }: {
    route: RuntimeRouteHandler;
    open: RuntimeOpenHandler;
    focus: RuntimeFocusHandler;
    menu: RuntimeMenuHandler;
  }): { focused: boolean } {
    // Register platform-agnostic handlers
    this.__handlers.route = route;
    this.__handlers.open = open;
    this.__handlers.focus = focus;
    this.__handlers.menu = menu;

    // Return current values (can be used to synchronize external states)
    return {
      focused: this.__states.focused
    };
  }

  unregisterHandlers(): void {
    // Unregister platform-agnostic handlers
    this.__handlers.route = null;
    this.__handlers.open = null;
    this.__handlers.focus = null;
    this.__handlers.menu = null;
  }

  async requestOpenUrl(url: string, target = "_blank"): Promise<void> {
    if (this.__isApplication === true) {
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
    if (this.__isApplication === true) {
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

  async requestNotificationSend(
    title: string,
    body: string,
    route?: RuntimeNotificationRoute
  ): Promise<void> {
    // Skip notification banners if window has focus
    if (this.__states.focused !== true) {
      const hasPermission = await this.requestNotificationPermission();

      if (hasPermission === true) {
        // Build local click handler
        const clickHandler = async () => {
          if (route !== undefined && this.__handlers.route !== null) {
            await this.__handlers.route(route.name, route.params);
          }
        };

        if (this.__isApplication === true) {
          // Request to show notification via Tauri API (application build)
          const action: RuntimeNotificationAction = await tauriInvoke(
            "plugin:notifications|send_notification",

            {
              title,
              body,
              route
            }
          );

          // Handle action on notification
          // TODO: actions do not really work, since we had to disable \
          //   blocking notifications due to the way the underlying \
          //   mac_notification_sys works. If we want to wait for user \
          //   interaction, then we have to use send_notification from \
          //   mac_notification_sys which blocks the whole Tauri thread. We \
          //   have to find a fully async variant of mac_notification_sys.
          switch (action) {
            case RuntimeNotificationAction.Click: {
              await clickHandler();

              break;
            }
          }
        } else {
          // Request to show notification via browser APIs (Web build)
          const notification = new Notification(title, { body });

          notification.addEventListener("click", clickHandler);
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

    if (this.__isApplication === true) {
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
    if (this.__isApplication === true) {
      // Request to update unread count via Tauri API (application build)
      await tauriInvoke("plugin:notifications|set_badge_count", {
        count
      });
    } else {
      // Request to update unread count via browser APIs (Web build)
      UtilitiesTitle.setUnreadCount(count);
    }
  }

  async requestFullscreenEnter(element: HTMLElement): Promise<boolean> {
    let enteredFullScreen = false;

    if (this.__isApplication === true) {
      // Request to enter full screen mode via Tauri API (application build)
      await tauriAppWindow.setFullscreen(true);

      enteredFullScreen = true;
    } else {
      // Request to enter full screen mode via browser APIs (Web build)
      // Notice: do not mark as entered full screen there, since it is not \
      //   a real whole-application full screen, but rather an element-based \
      //   full screen.
      await element.requestFullscreen();
    }

    return enteredFullScreen;
  }

  async requestFullscreenLeave(): Promise<boolean> {
    let leftFullScreen = false;

    if (this.__isApplication === true) {
      // Request to leave full screen mode via Tauri API (application build)
      await tauriAppWindow.setFullscreen(false);

      leftFullScreen = true;
    } else {
      // Request to leave full screen mode via browser APIs (Web build)
      // Notice: do not mark as left full screen there, since it was not \
      //   a real whole-application full screen, but rather an element-based \
      //   full screen.
      try {
        await document.exitFullscreen();
      } catch (_) {
        // Ignore errors (not in full screen mode)
      }
    }

    return leftFullScreen;
  }

  async requestWindowCenter(): Promise<void> {
    if (this.__isApplication === true) {
      // Request to center window via Tauri API (application build)
      await tauriAppWindow.center();
    }
  }

  async requestWindowResizableChange(
    resizable: boolean
  ): Promise<boolean | void> {
    if (this.__isApplication === true) {
      const currentResizable = await tauriAppWindow.isResizable();

      // Request to change resizable flag via Tauri API (application build)
      await tauriAppWindow.setResizable(resizable);

      // Return previous resizable flag value
      return currentResizable;
    }

    return undefined;
  }

  async requestWindowSizeUpdate(
    width: number,
    height: number
  ): Promise<{ width: number; height: number } | void> {
    if (this.__isApplication === true) {
      // Acquire current window size via Tauri API (application build)
      const currentSize = (await tauriAppWindow.innerSize()).toLogical(
        await tauriAppWindow.scaleFactor()
      );

      // Request to update window size via Tauri API (application build)
      await tauriAppWindow.setSize(new tauriLogicalSize(width, height));

      // Return previous window size
      return { width: currentSize.width, height: currentSize.height };
    }

    return undefined;
  }

  async requestUpdateCheck(): Promise<void> {
    if (this.__isApplication === true) {
      // Request to check for updates via Tauri API (application build)
      await tauriEmit(TauriEvent.CHECK_UPDATE);
    } else {
      // Feature not available on other platforms (eg. Web build)
    }
  }

  async requestLog(
    level: RuntimeLogLevel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...messages: Array<any>
  ): Promise<void> {
    if (this.__isApplication === true) {
      // Request to log message via Tauri API (application build)
      await LOG_METHODS.application[level](
        messages
          .map(message => {
            // Stringify message for logging output (using the best available \
            //   method for input type)
            if (typeof message === "string") {
              return message;
            }

            if (typeof message === "object" && message instanceof Error) {
              return message.toString();
            }

            return JSON.stringify(message);
          })
          .join(" ")
      );
    } else {
      // Request to log message via browser APIs (Web build)
      LOG_METHODS.browser[level](`[${level.toUpperCase()}]`, ...messages);
    }
  }

  private __bindListeners(): void {
    if (this.__isApplication === true) {
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
          try {
            const urlParts = payload.toLowerCase().split(":");

            if (!urlParts[0] || !urlParts[1]) {
              throw new Error("Empty URL protocol or path");
            }

            // Trigger open handler? (if any)
            if (this.__handlers.open !== null) {
              this.__handlers.open(urlParts[0], urlParts[1]);
            }
          } catch (error) {
            logger.error(`Not opening URL as it is invalid: ${payload}`, error);
          }
        }
      );

      tauriAppWindow.listen<string>("menu:select", async ({ payload }) => {
        // Trigger menu handler? (if any)
        if (this.__handlers.menu !== null) {
          await this.__handlers.menu(payload);
        }
      });

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

export { RuntimeLogLevel, platform, context, translucent };
export default new UtilitiesRuntime();
