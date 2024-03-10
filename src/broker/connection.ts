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

interface ConnectionRelayHost {
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

class BrokerConnectionStrophe implements ProseConnection {
  private readonly __config: ProseClientConfig;

  private __connection?: Strophe.Connection;
  private __eventHandler?: ProseConnectionEventHandler;

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
            logger.debug("Connecting…");

            break;
          }

          // [DISCONNECTING] The connection is currently being terminated
          case Strophe.Status.DISCONNECTING: {
            logger.debug("Disconnecting…");

            break;
          }

          // [DISCONNECTED] The connection has been terminated
          case Strophe.Status.DISCONNECTED: {
            logger.warn("Disconnected");

            this.__eventHandler?.handleDisconnect();

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
            logger.debug("Authenticating…");

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

    // Assign connection
    this.__connection = connection;

    return connection;
  }

  private async __acquireRelayHost(
    domain: string
  ): Promise<ConnectionRelayHost> {
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
      logger.debug("🔵 XMPP IN", data);
    }

    // Pass to event handler?
    if (this.__eventHandler !== undefined) {
      this.__eventHandler.handleStanza(data);
    }
  }

  private __onOutput(data: string): void {
    // Trace raw output?
    if (this.__config.logSentStanzas === true) {
      logger.debug("🔴 XMPP OUT", data);
    }
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

class BrokerConnection implements ProseConnectionProvider {
  provideConnection(config: ProseClientConfig): ProseConnection {
    return new BrokerConnectionStrophe(config);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerConnection;
