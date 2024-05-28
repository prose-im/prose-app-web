/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  JID,
  ProseClientConfig,
  ProseConnection,
  ProseConnectionErrorType,
  ProseConnectionEventHandler,
  ProseConnectionProvider
} from "@prose-im/prose-sdk-js";
import { Strophe } from "strophe.js";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface WebSocketRelayHost {
  url: string;
  protocol?: string;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const RELAY_HOST_METADATA_PARSE = [
  {
    xmlns: "urn:xmpp:alt-connections:websocket",
    protocol: "wss"
  },

  {
    xmlns: "urn:xmpp:alt-connections:xbosh",
    protocol: undefined
  }
];

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionWebSocketStrophe implements ProseConnection {
  private readonly __config: ProseClientConfig;

  private __connection?: Strophe.Connection;
  private __relayHost?: WebSocketRelayHost;
  private __eventHandler?: ProseConnectionEventHandler;

  private __connectIntent = false;

  constructor(config: ProseClientConfig) {
    // Assign configuration
    this.__config = config;
  }

  async connect(jidString: string, password: string): Promise<void> {
    // Acquire bare JID
    // Important: strip resource from JID so that it can be parsed
    const jid = new JID(jidString.split("/")[0]);

    // Create connection (on domain)
    const connection = await this.__createConnection(jid.domain);

    // Connect (using just bound connection)
    return new Promise((resolve, reject) => {
      connection.connect(jidString, password, status => {
        switch (status) {
          // [CONNECTING] The connection is currently being made
          case Strophe.Status.CONNECTING: {
            logger.info("Connecting…");

            // Enable connect intent marker
            this.__connectIntent = true;

            break;
          }

          // [DISCONNECTING] The connection is currently being terminated
          case Strophe.Status.DISCONNECTING: {
            // Hack: make sure we have ever intended to be connected before \
            //   triggering the disconnecting handler, since Strophe emits the \
            //   disconnecting event when re-initializing the connection, \
            //   which we do not expect and (may) cause side-effects with the \
            //   core client connection management system.
            if (this.__connectIntent === true) {
              logger.info("Disconnecting…");
            } else {
              logger.warn("Received disconnecting (but was not connected)");
            }

            break;
          }

          // [DISCONNECTED] The connection has been terminated
          case Strophe.Status.DISCONNECTED: {
            // Hack: make sure we have ever intended to be connected before \
            //   triggering the disconnected handler, since Strophe emits the \
            //   disconnected event when first re-initializing the connection, \
            //   which we do not expect and (will) cause side-effects with the \
            //   core client connection management system.
            if (this.__connectIntent === true) {
              logger.warn("Disconnected");

              // Disable connect intent marker
              this.__connectIntent = false;

              // Pass disconnected event to caller client
              this.__eventHandler?.handleDisconnect();
            } else {
              logger.warn("Received disconnected (but was not connected)");
            }

            // Destroy connection (permanently, we do not allow re-use here)
            this.__destroyConnection();

            break;
          }

          // [CONNECTED] The connection has succeeded
          case Strophe.Status.CONNECTED: {
            logger.info("Connected");

            resolve();

            break;
          }

          // [AUTHFAIL] The authentication attempt failed
          case Strophe.Status.AUTHFAIL: {
            logger.error("Authentication failure");

            reject(ProseConnectionErrorType.InvalidCredentials);

            break;
          }

          // [CONNFAIL] The connection attempt failed
          case Strophe.Status.CONNFAIL: {
            logger.error("Connection failure");

            reject(ProseConnectionErrorType.Generic);

            break;
          }

          // [CONNTIMEOUT] The connection has timed out
          case Strophe.Status.CONNTIMEOUT: {
            logger.error("Connection timed out");

            reject(ProseConnectionErrorType.TimedOut);

            break;
          }

          // [ERROR] An error has occurred
          case Strophe.Status.ERROR: {
            logger.error("Connection error");

            reject(ProseConnectionErrorType.Generic);

            break;
          }

          // [AUTHENTICATING] The connection is authenticating
          case Strophe.Status.AUTHENTICATING: {
            logger.info("Authenticating…");

            break;
          }

          // [ATTACHED] The connection has been attached
          case Strophe.Status.ATTACHED: {
            logger.info("Connection has been attached to");

            break;
          }

          // [REDIRECT] The connection has been redirected
          case Strophe.Status.REDIRECT: {
            logger.info("Connection has been redirected");

            break;
          }

          // [OTHER] Unhandled connection event received
          default: {
            logger.warn("Received unhandled connection event");
          }
        }
      });
    });
  }

  disconnect(): void {
    this.__connection?.disconnect("logout");
  }

  sendStanza(stanza: string): void {
    // Parse stanza into DOM
    const element = new DOMParser().parseFromString(
      stanza,
      "text/xml"
    ).firstElementChild;

    if (!element) {
      logger.error("Cannot parse stanza to send:", stanza);

      throw new Error("Failed to send stanza");
    }

    // Assert connection
    if (!this.__connection) {
      throw new Error("Cannot send stanza, there is no connection");
    }

    this.__connection.send(element);
  }

  setEventHandler(handler: ProseConnectionEventHandler): void {
    this.__eventHandler = handler;
  }

  private async __createConnection(
    domain: string
  ): Promise<Strophe.Connection> {
    // Acquire relay host from domain
    if (!domain) {
      throw new Error("No domain to acquire relay host from");
    }

    const relayHost = await this.__acquireRelayHost(domain);

    // Create connection
    const connection = new Strophe.Connection(relayHost.url, {
      protocol: relayHost.protocol || undefined
    });

    // Configure connection
    connection.maxRetries = 0;

    // Bind handlers
    connection.rawInput = this.__onInput.bind(this);
    connection.rawOutput = this.__onOutput.bind(this);

    this.__bindDummyHandler(connection);

    // Assign connection and its relay host
    this.__relayHost = relayHost;
    this.__connection = connection;

    return connection;
  }

  private __destroyConnection(): void {
    if (this.__connection !== undefined) {
      // Reset connection
      this.__connection.reset();

      // Un-assign connection
      delete this.__connection;
    }

    if (this.__relayHost !== undefined) {
      // Un-assign relay host
      delete this.__relayHost;
    }

    // Clear registered event handler (if any)
    if (this.__eventHandler !== undefined) {
      delete this.__eventHandler;
    }
  }

  private async __acquireRelayHost(
    domain: string
  ): Promise<WebSocketRelayHost> {
    // XEP-0156: Discovering Alternative XMPP Connection Methods
    // https://xmpp.org/extensions/xep-0156.html

    try {
      // Fetch host metadata file (if any)
      let xmlString: string | null = null;

      const hostMetaOverride = CONFIG.overrides?.hostMeta?.[domain] || null;

      if (hostMetaOverride !== null) {
        xmlString = hostMetaOverride;
      } else {
        const response = await fetch(
          `https://${domain}/.well-known/host-meta`,
          {
            mode: "cors"
          }
        );

        if (response.ok === true) {
          xmlString = (await response.text()) || null;
        }
      }

      if (xmlString !== null) {
        // Read XML string from host-meta
        const xmlElement = new DOMParser().parseFromString(
          xmlString,
          "text/xml"
        );

        // Acquire connection URL (priorized)
        for (let i = 0; i < RELAY_HOST_METADATA_PARSE.length; i++) {
          const metadataParse = RELAY_HOST_METADATA_PARSE[i];

          const linkElement =
            xmlElement.querySelector(`Link[rel="${metadataParse.xmlns}"]`) ||
            null;

          if (linkElement !== null) {
            const linkUrl = linkElement.getAttribute("href") || null;

            if (linkUrl !== null) {
              return {
                url: linkUrl,
                protocol: metadataParse.protocol
              };
            }
          }
        }
      }
    } catch (error) {
      logger.error(`Error loading relay host from domain: ${domain}`, error);
    }

    // Generate default URL (fallback)
    logger.warn(`Using fallback relay host for domain: ${domain}`);

    return {
      url: `wss://${domain}/websocket/`,
      protocol: "wss"
    };
  }

  private __onInput(data: string): void {
    // Trace raw input?
    if (this.__config.logReceivedStanzas === true) {
      logger.debug(`🔵 XMPP/${this.__protocol()} IN`, data);
    }

    // Pass to event handler?
    if (this.__eventHandler !== undefined) {
      this.__eventHandler.handleStanza(data);
    }
  }

  private __onOutput(data: string): void {
    // Trace raw output?
    if (this.__config.logSentStanzas === true) {
      logger.debug(`🔴 XMPP/${this.__protocol()} OUT`, data);
    }
  }

  private __protocol(fallback = "bosh"): string {
    return this.__relayHost?.protocol?.toUpperCase() || fallback;
  }

  private __bindDummyHandler(connection: Strophe.Connection): void {
    // Bind dummy handler function on '*' stanza types
    // Notice: this is required so that Strophe.js thinks that all received \
    //   stanza types are handled and processed. If a stanza does not get \
    //   processed, Strophe.js usually automatically replies with an error, \
    //   which is undesired as stanzas already get handled by the Prose JS SDK.
    connection.addHandler(() => {
      // Important: return true so that the handler is kept alive at each \
      //   received stanza.
      return true;
    });
  }
}

class BrokerConnectionWebSocket implements ProseConnectionProvider {
  provideConnection(config: ProseClientConfig): ProseConnection {
    return new BrokerConnectionWebSocketStrophe(config);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerConnectionWebSocket;
