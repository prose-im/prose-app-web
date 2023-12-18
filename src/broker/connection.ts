/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Strophe } from "strophe.js";
import {
  ProseConnection,
  ProseConnectionProvider,
  ProseClientConfig,
  ProseConnectionEventHandler
} from "@prose-im/prose-sdk-js";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerConnectionStrophe implements ProseConnection {
  private readonly __config: ProseClientConfig;
  private readonly __connection: Strophe.Connection;

  private __eventHandler?: ProseConnectionEventHandler;

  constructor(config: ProseClientConfig) {
    // Assign configuration
    this.__config = config;

    // Acquire relay host
    const relayHost = CONFIG.hosts.websocket || null;

    if (!relayHost) {
      throw new Error("No relay host to connect to");
    }

    // Create connection
    this.__connection = new Strophe.Connection(relayHost, { protocol: "wss" });

    // Configure connection
    this.__connection.maxRetries = 0;

    // Bind handlers
    this.__connection.rawInput = this.__onInput.bind(this);
    this.__connection.rawOutput = this.__onOutput.bind(this);

    this.__bindDummyHandler(this.__connection);
  }

  async connect(jid: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.__connection.connect(jid, password, status => {
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

            reject(new Error("The prose address and/or password is invalid"));

            this.__eventHandler?.handleDisconnect();

            break;
          }

          // [CONNFAIL] The connection attempt failed
          case Strophe.Status.CONNFAIL: {
            logger.error("Connection failure");

            // if the websocket address is "wss://chat.prose.org/websocket/"
            // and you attempt to sign in with "username@movim.eu", the server returns
            // <stream:error xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams'>
            // <host-unknown xmlns='urn:ietf:params:xml:ns:xmpp-streams'/>
            // <text xmlns='urn:ietf:params:xml:ns:xmpp-streams'>This server does not serve chat.lazytapir.comaoeu</text>
            // </stream:error>
            // and CONNFAIL of AUTHFAIL
            // This is a really ambigous error for that
            reject(new Error("Something went wrong"));

            break;
          }

          // [CONNTIMEOUT] The connection has timed out
          case Strophe.Status.CONNTIMEOUT: {
            logger.error("Connection timed out");

            break;
          }

          // [ERROR] An error has occurred
          case Strophe.Status.ERROR: {
            logger.error("Connection error");

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
    this.__connection.disconnect("logout");
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

    this.__connection.send(element);
  }

  setEventHandler(handler: ProseConnectionEventHandler): void {
    this.__eventHandler = handler;
  }

  private __onInput(data: string): void {
    // Trace raw input?
    if (this.__config.logReceivedStanzas === true) {
      logger.debug("(in)", data);
    }

    // Pass to event handler?
    if (this.__eventHandler !== undefined) {
      this.__eventHandler.handleStanza(data);
    }
  }

  private __onOutput(data: string): void {
    // Trace raw output?
    if (this.__config.logSentStanzas === true) {
      logger.debug("(out)", data);
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
