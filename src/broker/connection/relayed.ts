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
  ProseConnection,
  ProseConnectionErrorType
} from "@prose-im/prose-sdk-js";
import { Strophe } from "strophe.js";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: BROKER
import BrokerConnection from "@/broker/connection/index";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

type RelayHostProtocol = "wss" | undefined;
type RelayHostJRDValue = { [key: string]: string };

// @ts-expect-error Strophe type exports are borked
type StropheConnection = Strophe.Connection;

// @ts-expect-error Strophe type exports are borked
type StropheStatus = Strophe.Status;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface RelayHost {
  url: string;
  protocol?: RelayHostProtocol;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const RELAY_HOST_METADATA_PARSE = [
  {
    xmlns: "urn:xmpp:alt-connections:websocket",
    protocol: "wss" as RelayHostProtocol
  },

  {
    xmlns: "urn:xmpp:alt-connections:xbosh",
    protocol: undefined as RelayHostProtocol
  }
];

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionRelayedStrophe
  extends BrokerConnection
  implements ProseConnection
{
  private __connection?: StropheConnection;
  private __relayHost?: RelayHost;

  private __connectIntent = false;

  async connect(jidString: string, password: string): Promise<void> {
    logger.info(
      `Broker will connect via a relayed connection to: ${jidString}`
    );

    // Acquire bare JID
    // Important: strip resource from JID so that it can be parsed
    const jid = new JID(jidString.split("/")[0]);

    // Create connection (on domain)
    const connection = await this.__createConnection(jid.domain);

    // Connect (using just bound connection)
    return new Promise((resolve, reject) => {
      connection.connect(jidString, password, (status: StropheStatus) => {
        switch (status) {
          // [CONNECTING] The connection is currently being made
          case Strophe.Status.CONNECTING: {
            logger.info("Broker connecting…");

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
              logger.info("Broker disconnecting…");
            } else {
              logger.warn(
                "Broker received disconnecting (but was not connected)"
              );
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
              logger.warn("Broker disconnected");

              // Disable connect intent marker
              this.__connectIntent = false;

              // Pass disconnected event to caller client
              if (this._eventHandler !== undefined) {
                this._eventHandler.handleDisconnect();
              } else {
                logger.warn(
                  "Broker could not signal disconnection " +
                    "(no active event handler)"
                );
              }
            } else {
              logger.warn(
                "Broker received disconnected (but was not connected)"
              );
            }

            // Destroy connection (permanently, we do not allow re-use here)
            this.__destroyConnection();

            break;
          }

          // [CONNECTED] The connection has succeeded
          case Strophe.Status.CONNECTED: {
            logger.info("Broker connected");

            resolve();

            break;
          }

          // [AUTHFAIL] The authentication attempt failed
          case Strophe.Status.AUTHFAIL: {
            logger.error("Broker authentication failure");

            reject(ProseConnectionErrorType.InvalidCredentials);

            break;
          }

          // [CONNFAIL] The connection attempt failed
          case Strophe.Status.CONNFAIL: {
            logger.error("Broker connection failure");

            reject(ProseConnectionErrorType.Generic);

            break;
          }

          // [CONNTIMEOUT] The connection has timed out
          case Strophe.Status.CONNTIMEOUT: {
            logger.error("Broker connection timed out");

            reject(ProseConnectionErrorType.TimedOut);

            break;
          }

          // [ERROR] An error has occurred
          case Strophe.Status.ERROR: {
            logger.error("Broker connection error");

            reject(ProseConnectionErrorType.Generic);

            break;
          }

          // [AUTHENTICATING] The connection is authenticating
          case Strophe.Status.AUTHENTICATING: {
            logger.info("Broker authenticating…");

            break;
          }

          // [ATTACHED] The connection has been attached
          case Strophe.Status.ATTACHED: {
            logger.info("Broker connection has been attached to");

            break;
          }

          // [REDIRECT] The connection has been redirected
          case Strophe.Status.REDIRECT: {
            logger.info("Broker connection has been redirected");

            break;
          }

          // [OTHER] Unhandled connection event received
          default: {
            logger.warn("Broker received unhandled connection event");
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
      logger.error("Broker cannot parse stanza to send:", stanza);

      throw new Error("Failed to send stanza");
    }

    // Assert connection
    if (!this.__connection) {
      throw new Error("Cannot send stanza, there is no connection");
    }

    this.__connection.send(element);
  }

  protected _protocol(fallback = "bosh"): string {
    return `XMPP/${this.__relayHost?.protocol?.toUpperCase() || fallback}`;
  }

  private async __createConnection(domain: string): Promise<StropheConnection> {
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
    connection.rawInput = this._onInput.bind(this);
    connection.rawOutput = this._onOutput.bind(this);

    this.__bindDummyHandler(connection);

    // Assign connection and its relay host
    this.__relayHost = relayHost;
    this.__connection = connection;

    // Start timers (for connection management)
    this._startTimers();

    return connection;
  }

  private __destroyConnection(): void {
    // Stop timers (for connection management)
    this._stopTimers();

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
    if (this._eventHandler !== undefined) {
      delete this._eventHandler;
    }
  }

  private async __acquireRelayHost(domain: string): Promise<RelayHost> {
    // XEP-0156: Discovering Alternative XMPP Connection Methods
    // https://xmpp.org/extensions/xep-0156.html

    // #1. Attempt to fetch the XRD relay host file
    try {
      const relayHost = await this.__fetchRelayHostXRD(domain);

      logger.debug(
        `Loaded relay host from XRD from domain: ${domain}`,
        relayHost
      );

      return relayHost;
    } catch (error) {
      logger.warn(
        `Could not load the XRD relay host from domain: ${domain}`,
        error
      );
    }

    // #2. Attempt to fetch the JRD relay host file
    try {
      const relayHost = await this.__fetchRelayHostJRD(domain);

      logger.debug(
        `Loaded relay host from JRD from domain: ${domain}`,
        relayHost
      );

      return relayHost;
    } catch (error) {
      logger.warn(
        `Could not load the JRD relay host from domain: ${domain}`,
        error
      );
    }

    // #3. Generate default URL (fallback)
    const relayHost: RelayHost = {
      url: `wss://${domain}/websocket/`,
      protocol: "wss"
    };

    logger.warn(
      `Broker using fallback relay host for domain: ${domain}`,
      relayHost
    );

    return relayHost;
  }

  private async __fetchRelayHostXRD(domain: string): Promise<RelayHost> {
    const xmlString = await this.__obtainRelayHostData(domain, "xrd");

    if (xmlString !== null) {
      // Read XML string from host-meta
      const xmlElement = new DOMParser().parseFromString(xmlString, "text/xml");

      // Acquire connection URL (prioritized)
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

    throw new Error("No XRD host file");
  }

  private async __fetchRelayHostJRD(domain: string): Promise<RelayHost> {
    const jsonString = await this.__obtainRelayHostData(domain, "jrd", ".json");

    if (jsonString !== null) {
      // Parse JSON from host-meta
      const jsonData = JSON.parse(jsonString);

      // Acquire all link URLs
      const linkUrls: RelayHostJRDValue = {};

      jsonData.links?.forEach((link: RelayHostJRDValue) => {
        linkUrls[link.rel] = link.href;
      });

      // Acquire connection URL (prioritized)
      for (let i = 0; i < RELAY_HOST_METADATA_PARSE.length; i++) {
        const metadataParse = RELAY_HOST_METADATA_PARSE[i],
          linkUrl = linkUrls[metadataParse.xmlns] || null;

        if (linkUrl !== null) {
          return {
            url: linkUrl,
            protocol: metadataParse.protocol
          };
        }
      }
    }

    throw new Error("No JRD host file");
  }

  private async __obtainRelayHostData(
    domain: string,
    format: string,
    pathSuffix = ""
  ): Promise<string | null> {
    let data: string | null = null;

    const hostMetaOverride =
      CONFIG.overrides?.hostMeta?.[domain]?.[format] || null;

    if (hostMetaOverride !== null) {
      data = hostMetaOverride;
    } else {
      const response = await fetch(
        `https://${domain}/.well-known/host-meta${pathSuffix}`,
        {
          mode: "cors"
        }
      );

      if (response.ok === true) {
        data = (await response.text()) || null;
      }
    }

    return data;
  }

  private __bindDummyHandler(connection: StropheConnection): void {
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

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { BrokerConnectionRelayedStrophe };
