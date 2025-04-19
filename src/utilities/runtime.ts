/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { check as tauriUpdateCheck } from "@tauri-apps/plugin-updater";
import { relaunch as tauriProcessRelaunch } from "@tauri-apps/plugin-process";
import { open as tauriOpen } from "@tauri-apps/plugin-shell";
import {
  ask as tauriDialogAsk,
  message as tauriDialogMessage
} from "@tauri-apps/plugin-dialog";
import {
  getCurrentWindow as tauriWindow,
  LogicalSize as tauriLogicalSize
} from "@tauri-apps/api/window";
import {
  isPermissionGranted as tauriNotificationIsPermissionGranted,
  requestPermission as tauriNotificationRequestPermission,
  sendNotification as tauriNotificationSendNotification
} from "@tauri-apps/plugin-notification";
import {
  debug as tauriLogDebug,
  error as tauriLogError,
  info as tauriLogInfo,
  warn as tauriLogWarn
} from "@tauri-apps/plugin-log";
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

enum RuntimeUpdateCheckMode {
  // Interactive mode.
  Interactive = "interactive",
  // Background mode.
  Background = "background"
}

enum RuntimeDialogKind {
  // Error kind.
  Error = "error",
  // Warning kind.
  Warning = "warning",
  // Info kind.
  Info = "info"
}

enum RuntimeUrlOpenTarget {
  // Self target.
  Self = "_self",
  // Blank target.
  Blank = "_blank"
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
const nativeNotifications = platform === "macos";

const NOTIFICATION_PERMISSIONS = {
  granted: "granted",
  denied: "denied"
};

const PLATFORM_NAMES: { [platform: string]: string } = {
  web: "Web",
  macos: "macOS",
  windows: "Windows",
  linux: "Linux"
};

const PLATFORM_RENDERERS: { [platform: string]: string } = {
  macos: "safari",
  windows: "edge"
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

  async requestOpenUrl(
    url: string,
    target = RuntimeUrlOpenTarget.Blank
  ): Promise<void> {
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

      await tauriInvoke("plugin:download|file", {
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
          // Show notification using the native notification sender, or the \
          //   generic Tauri-provided one?
          // Notice: we have implemented better notification integrations on \
          //   systems where we thought that the Tauri notification \
          //   integration fell short. For instance, it is currently — as of \
          //   April 2025 — impossible to bind a click handler on \
          //   notifications sent from Tauri. However, it is common practice \
          //   on macOS apps to react to clicks on notification banners. We \
          //   fixed this by building our own native notifier.
          if (nativeNotifications === true) {
            const notificationId: string | null = await tauriInvoke(
              "plugin:notifications|send_native",

              {
                title: notificationTitle,
                body,
                route
              }
            );

            // Store notification handlers? (for later use)
            if (notificationId !== null) {
              this.__handlers.global.notification.set(notificationId, {
                click: clickHandler
              });
            }
          } else {
            // Request to show notification via Tauri API (application build)
            tauriNotificationSendNotification({
              title: notificationTitle,
              body
            });
          }
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
      // Request notification permissions via Tauri API
      // Notice: for native, permission request is managed at a lower level, \
      //   therefore always consider we have permission for native senders.
      if (nativeNotifications === true) {
        hasPermission = true;
      } else {
        hasPermission = await tauriNotificationIsPermissionGranted();

        if (hasPermission === false) {
          hasPermission =
            (await tauriNotificationRequestPermission()) ===
            NOTIFICATION_PERMISSIONS.granted;
        }
      }
    } else {
      // Request notification permissions via browser APIs (Web build)
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
      await tauriWindow().setFullscreen(true);

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
      await tauriWindow().setFullscreen(false);

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
      await tauriWindow().center();
    }
  }

  async requestWindowResizableChange(
    resizable: boolean
  ): Promise<boolean | void> {
    if (this.__isApplication === true) {
      const currentResizable = await tauriWindow().isResizable();

      // Request to change resizable flag via Tauri API (application build)
      await tauriWindow().setResizable(resizable);

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
      const currentSize = (await tauriWindow().innerSize()).toLogical(
        await tauriWindow().scaleFactor()
      );

      // Request to update window size via Tauri API (application build)
      await tauriWindow().setSize(new tauriLogicalSize(width, height));

      // Return previous window size
      return { width: currentSize.width, height: currentSize.height };
    }

    return undefined;
  }

  async requestUpdateCheckAndInstall(
    mode = RuntimeUpdateCheckMode.Background
  ): Promise<boolean | void> {
    if (this.__isApplication === true) {
      // Request to check for updates via Tauri API (application build)
      const isInteractive = mode === RuntimeUpdateCheckMode.Interactive;

      // Check for updates (this calls home)
      // Notice: the update process is a bit complex and tedious, since Tauri \
      //   does not handle the nitty gritty details anymore since Tauri \
      //   version 2. Therefore we have to implement the whole download, \
      //   install, confirm and restart flow here. This can be considered a \
      //   good thing, since custom UI and logic can be implemented regarding \
      //   to how and when eg. restarts are done.
      let update = null;

      try {
        update = await tauriUpdateCheck();
      } catch (error) {
        logger.error(
          "Failed checking for updates (considering as no update available)",
          error
        );
      }

      if (update !== null) {
        try {
          await update.downloadAndInstall();

          // Interactive mode? Ask user if they want to restart now
          if (isInteractive === true) {
            const confirmed = await this.requestDialogConfirm(
              "Update installed",
              "Restart Prose now?"
            );

            if (confirmed === true) {
              await tauriProcessRelaunch();
            }
          }

          // Update available and installed
          return true;
        } catch (error) {
          logger.error(
            `Failed downloading and installing update: ${update.version}`,
            error
          );

          // Interactive mode? Let the user know that the update failed
          if (isInteractive === true) {
            await this.requestDialogAlert(
              "Could not apply update",
              "An error occurred when downloading and installing the update.",
              RuntimeDialogKind.Error
            );
          }

          // Update available but not installed
          return undefined;
        }
      }

      // Interactive mode? Let us know no update was found
      if (isInteractive === true) {
        await this.requestDialogAlert(
          "No update available",
          "Prose is already up to date!"
        );
      }

      // No update available
      return false;
    }

    return undefined;
  }

  async requestDialogConfirm(
    title: string,
    message: string,
    kind = RuntimeDialogKind.Info
  ): Promise<boolean | void> {
    if (this.__isApplication === true) {
      // Request to show dialog via Tauri API (application build)
      return await tauriDialogAsk(message, {
        title,
        kind
      });
    }

    return undefined;
  }

  async requestDialogAlert(
    title: string,
    message: string,
    kind = RuntimeDialogKind.Info
  ): Promise<void> {
    if (this.__isApplication === true) {
      // Request to show dialog via Tauri API (application build)
      await tauriDialogMessage(message, {
        title,
        kind
      });
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
    const methods = [];

    if (this.__isApplication === true) {
      // Allow native connection method via Tauri backend (application build)
      // Notice: prioritized if available.
      methods.push(RuntimeConnectionMethod.Native);
    }

    // Allow relayed connection method via Web frontend (Web build or \
    //   application build)
    // Notice: fallback in any case.
    methods.push(RuntimeConnectionMethod.Relayed);

    return methods;
  }

  acquirePlatformName(): string {
    // Humanize platform to a platform name (eg. 'macos' becomes 'macOS'), or \
    //   fallback to raw platform code if no system name is known
    return PLATFORM_NAMES[platform] || platform;
  }

  acquirePlatformRenderer(): string | null {
    // Acquire known platform rendering engine (if any engine is forced as it \
    //   is known in advance in certain cases)
    return PLATFORM_RENDERERS[platform] || null;
  }

  private __bindListeners(): void {
    if (this.__isApplication === true) {
      // Register listeners via Tauri API (application build)
      this.__states.focused = true;

      tauriWindow().listen<RuntimeDownloadProgressPayload>(
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

      tauriWindow().listen<string>(
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

      tauriWindow().listen<string>("menu:select", async ({ payload }) => {
        // Trigger menu handler? (if any)
        if (this.__handlers.global.menu !== null) {
          await this.__handlers.global.menu(payload);
        }
      });

      tauriWindow().listen<boolean>("window:focus", ({ payload }) => {
        this.__changeFocusState(payload);
      });

      tauriWindow().listen<RuntimeNotificationInteractionPayload>(
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

      tauriWindow().listen<RuntimeConnectionStatePayload>(
        "connection:state",

        ({ payload }) => {
          // Trigger connection state handler (if any)
          this.__handlers.connection[payload.id]?.state(payload.state);
        }
      );

      tauriWindow().listen<RuntimeConnectionReceivePayload>(
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
  RuntimeUpdateCheckMode,
  RuntimeDialogKind,
  RuntimeUrlOpenTarget,
  RuntimeConnectionState,
  RuntimeConnectionMethod,
  platform,
  context,
  translucent
};
export type { RuntimeConnectionID };
export default new UtilitiesRuntime();
