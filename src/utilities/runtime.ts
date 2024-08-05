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

enum RuntimeNotificationInteractionAction {
  // Click action.
  Click = "click",
  // Reply action.
  Reply = "reply",
  // Close action.
  Close = "close",
  // Other action.
  Other = "other",
  // None action.
  None = "none"
}

enum RuntimeConnectionState {
  // Connected state.
  Connected = "connected",
  // Disconnected state.
  Disconnected = "disconnected",
  // Authentication failure state.
  AuthenticationFailure = "authentication-failure",
  // Connection timeout state.
  ConnectionTimeout = "connection-timeout",
  // Connection error state.
  ConnectionError = "connection-error"
}

enum RuntimeConnectionMethod {
  // Native method.
  Native = "native",
  // Relayed method.
  Relayed = "relayed"
}

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type RuntimeNotificationClickHandler = () => void;
type RuntimeProgressHandler = (progress: number, total: number) => void;
type RuntimeFocusHandler = (focused: boolean) => void;
type RuntimeOpenHandler = (protocol: string, path: string) => void;
type RuntimeMenuHandler = (menu: string) => Promise<void>;

type RuntimeRouteHandler = (
  name: string,
  params?: { [name: string]: string }
) => Promise<void>;

type RuntimeConnectionStateHandler = (state: RuntimeConnectionState) => void;
type RuntimeConnectionReceiveHandler = (stanza: string) => void;

type RuntimeConnectionID = string;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface RuntimeDownloadProgressPayload {
  id: number;
  progress: number;
  total: number;
}

interface RuntimeNotificationInteractionPayload {
  id: string;
  action: RuntimeNotificationInteractionAction;
}

interface RuntimeConnectionReceivePayload {
  id: RuntimeConnectionID;
  stanza: string;
}

interface RuntimeConnectionStatePayload {
  id: RuntimeConnectionID;
  state: RuntimeConnectionState;
}

interface RuntimeNotificationRoute {
  name: string;
  params?: { [name: string]: string };
}

interface RuntimeNotificationHandlers {
  click: RuntimeNotificationClickHandler;
}

interface RuntimeConnectionHandlers {
  state: RuntimeConnectionStateHandler;
  receive: RuntimeConnectionReceiveHandler;
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
    global: {
      focus: null as RuntimeFocusHandler | null,
      route: null as RuntimeRouteHandler | null,
      open: null as RuntimeOpenHandler | null,
      menu: null as RuntimeMenuHandler | null,
      download: new Map() as Map<number, RuntimeProgressHandler>,
      notification: new Map() as Map<string, RuntimeNotificationHandlers>
    },

    connection: {} as {
      [id: RuntimeConnectionID]: RuntimeConnectionHandlers;
    }
  };

  constructor() {
    // Initialize markers
    this.__isApplication = context === "application";

    // Bind listeners
    this.__bindListeners();
  }

  registerGlobalHandlers({
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
    // Register platform-agnostic global handlers
    this.__handlers.global.route = route;
    this.__handlers.global.open = open;
    this.__handlers.global.focus = focus;
    this.__handlers.global.menu = menu;

    // Return current values (can be used to synchronize external states)
    return {
      focused: this.__states.focused
    };
  }

  unregisterGlobalHandlers(): void {
    // Unregister platform-agnostic global handlers
    this.__handlers.global.route = null;
    this.__handlers.global.open = null;
    this.__handlers.global.focus = null;
    this.__handlers.global.menu = null;
  }

  registerConnectionHandlers(
    id: RuntimeConnectionID,
    {
      state,
      receive
    }: {
      state: RuntimeConnectionStateHandler;
      receive: RuntimeConnectionReceiveHandler;
    }
  ): void {
    // Register platform-agnostic connection handlers
    this.__handlers.connection[id] = {
      state: state,
      receive: receive
    };
  }

  unregisterConnectionHandlers(id: RuntimeConnectionID): void {
    // Unregister platform-agnostic connection handlers
    delete this.__handlers.connection[id];
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
        this.__handlers.global.download.set(id, progressHandler);
      }

      await tauriInvoke("plugin:downloader|download_file", {
        id,
        url,
        filename
      });

      this.__handlers.global.download.delete(id);
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
    {
      force = false,
      subtitle,
      route
    }: {
      force?: boolean;
      subtitle?: string;
      route?: RuntimeNotificationRoute;
    } = {}
  ): Promise<void> {
    // Skip notification banners if window has focus (or forced)
    if (this.__states.focused !== true || force === true) {
      // Generate final notification title
      const notificationTitle = subtitle ? `${subtitle} (${title})` : title;

      // Check for permission
      const hasPermission = await this.requestNotificationPermission();

      if (hasPermission === true) {
        // Build local click handler
        const clickHandler = async () => {
          if (route !== undefined && this.__handlers.global.route !== null) {
            await this.__handlers.global.route(route.name, route.params);
          }
        };

        if (this.__isApplication === true) {
          // Request to show notification via Tauri API (application build)
          const notificationId: string = await tauriInvoke(
            "plugin:notifications|send_notification",

            {
              title: notificationTitle,
              body,
              route
            }
          );

          // Store notification handlers (for later use)
          this.__handlers.global.notification.set(notificationId, {
            click: clickHandler
          });
        } else {
          // Request to show notification via browser APIs (Web build)
          const notification = new Notification(notificationTitle, { body });

          notification.addEventListener("click", clickHandler);
        }
      } else {
        logger.warn(
          "Not sending notification since permission is denied:",
          notificationTitle
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

  async requestConnectionConnect(
    id: RuntimeConnectionID,
    jidString: string,
    password: string,
    timeout?: number
  ): Promise<void> {
    if (this.__isApplication === true) {
      // Request to connect via Tauri API (application build)
      await tauriInvoke("plugin:connection|connect", {
        jid: jidString,
        password,
        id,
        timeout
      });
    } else {
      // This method should NEVER be used on other platforms
      throw new Error(
        "Attempted to request connection connect on unsupported platform"
      );
    }
  }

  async requestConnectionDisconnect(id: RuntimeConnectionID): Promise<void> {
    if (this.__isApplication === true) {
      // Request to disconnect via Tauri API (application build)
      await tauriInvoke("plugin:connection|disconnect", { id });
    } else {
      // This method should NEVER be used on other platforms
      throw new Error(
        "Attempted to request connection disconnect on unsupported platform"
      );
    }
  }

  async requestConnectionDestroy(id: RuntimeConnectionID): Promise<void> {
    if (this.__isApplication === true) {
      // Request to destroy via Tauri API (application build)
      await tauriInvoke("plugin:connection|destroy", { id });
    } else {
      // This method should NEVER be used on other platforms
      throw new Error(
        "Attempted to request connection destroy on unsupported platform"
      );
    }
  }

  async requestConnectionSend(
    id: RuntimeConnectionID,
    stanza: string
  ): Promise<void> {
    if (this.__isApplication === true) {
      // Request to send via Tauri API (application build)
      await tauriInvoke("plugin:connection|send", {
        id,
        stanza
      });
    } else {
      // This method should NEVER be used on other platforms
      throw new Error(
        "Attempted to request connection send on unsupported platform"
      );
    }
  }

  acquireConnectionMethods(): Array<RuntimeConnectionMethod> {
    // Allow relayed connection method via Web frontend (Web build or \
    //   application build)
    const methods = [RuntimeConnectionMethod.Relayed];

    if (this.__isApplication === true) {
      // Allow native connection method via Tauri backend (application build)
      methods.push(RuntimeConnectionMethod.Native);
    }

    return methods;
  }

  private __bindListeners(): void {
    if (this.__isApplication === true) {
      // Register listeners via Tauri API (application build)
      this.__states.focused = true;

      tauriAppWindow.listen<RuntimeDownloadProgressPayload>(
        "download:progress",

        ({ payload }) => {
          const progressHandler = this.__handlers.global.download.get(
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
          try {
            const urlParts = payload.toLowerCase().split(":");

            if (!urlParts[0] || !urlParts[1]) {
              throw new Error("Empty URL protocol or path");
            }

            // Trigger open handler? (if any)
            if (this.__handlers.global.open !== null) {
              this.__handlers.global.open(urlParts[0], urlParts[1]);
            }
          } catch (error) {
            logger.error(`Not opening URL as it is invalid: ${payload}`, error);
          }
        }
      );

      tauriAppWindow.listen<string>("menu:select", async ({ payload }) => {
        // Trigger menu handler? (if any)
        if (this.__handlers.global.menu !== null) {
          await this.__handlers.global.menu(payload);
        }
      });

      tauriAppWindow.listen<boolean>("window:focus", ({ payload }) => {
        this.__changeFocusState(payload);
      });

      tauriAppWindow.listen<RuntimeNotificationInteractionPayload>(
        "notification:interaction",

        ({ payload }) => {
          const handlers = this.__handlers.global.notification.get(payload.id);

          if (handlers !== undefined) {
            switch (payload.action) {
              case RuntimeNotificationInteractionAction.Click: {
                // Trigger click handler
                handlers.click();

                break;
              }

              case RuntimeNotificationInteractionAction.Close: {
                // Delete registered handlers
                this.__handlers.global.notification.delete(payload.id);

                break;
              }

              default: {
                // Do nothing (ignore)
              }
            }
          }
        }
      );

      tauriAppWindow.listen<RuntimeConnectionStatePayload>(
        "connection:state",

        ({ payload }) => {
          // Trigger connection state handler (if any)
          this.__handlers.connection[payload.id]?.state(payload.state);
        }
      );

      tauriAppWindow.listen<RuntimeConnectionReceivePayload>(
        "connection:receive",

        ({ payload }) => {
          // Trigger connection receive handler (if any)
          this.__handlers.connection[payload.id]?.receive(payload.stanza);
        }
      );
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
    if (this.__handlers.global.focus !== null) {
      this.__handlers.global.focus(focused);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export {
  RuntimeLogLevel,
  RuntimeConnectionState,
  RuntimeConnectionMethod,
  platform,
  context,
  translucent
};
export type { RuntimeConnectionID };
export default new UtilitiesRuntime();
