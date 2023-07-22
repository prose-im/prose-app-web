/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { default as $, Cash } from "cash-dom";
import { Strophe } from "strophe.js";
import { JID, jid } from "@xmpp/jid";

// PROJECT: BROKER
import Broker from "@/broker";
import BrokerEvent from "@/broker/events";
import { IQType } from "@/broker/stanzas/iq";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

// Notice: Strophe types do not define the 'Strophe.Handler' type
type StropheHandler = object;

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface ConnectLifecycle {
  success: (value: void) => void;
  failure: (error: Error) => void;
}

interface PendingRequest {
  id: string;
  success: (stanza: Cash) => void;
  failure: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

// Notice: Strophe types do not define the 'connection' property
interface ConnectionWithConnected extends Strophe.Connection {
  connected: boolean;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const REQUEST_TIMEOUT_DEFAULT = 10000; // 10 seconds

const RECONNECT_INTERVAL = 5000; // 5 seconds

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerClient {
  jid?: JID;

  private readonly __ingestors: BrokerEvent;

  private __connection?: Strophe.Connection;
  private __connectLifecycle?: ConnectLifecycle;
  private __credentials?: { jid: JID; password: string };
  private __boundReceivers: Array<StropheHandler> = [];
  private __pendingRequests: { [id: string]: PendingRequest } = {};
  private __reconnectTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    // Initialize event ingestors
    this.__ingestors = new BrokerEvent(this);
  }

  async authenticate(jid: JID, password: string): Promise<void> {
    // Acquire relay host
    const relayHost = CONFIG.hosts.websocket || null;

    if (!relayHost) {
      throw new Error("No relay host configured");
    }

    // Incomplete parameters?
    if (!jid.toString()) {
      throw new Error("Please provide a Jabber ID");
    }
    if (!password) {
      throw new Error("Please provide a password");
    }
    if (!jid.getLocal()) {
      throw new Error("Invalid Jabber ID");
    }

    // Another connection pending?
    if (this.__connectLifecycle) {
      throw new Error("Another connection is pending");
    }

    // Another connection active?
    if (this.__connection) {
      throw new Error("Another connection already exist");
    }

    // Store credentials
    this.__credentials = {
      jid,
      password
    };

    // Connect to account
    await this.__connect(relayHost, jid, password);
  }

  logout(): void {
    this.__connection?.disconnect("logout");
  }

  emit(builder: Strophe.Builder) {
    // Emit stanza on the wire? (if connected)
    if (
      this.__connection &&
      (this.__connection as ConnectionWithConnected).connected === true
    ) {
      this.__connection.send(builder.tree());
    } else {
      throw new Error("Client is disconnected");
    }
  }

  async request(
    builder: Strophe.Builder,
    timeout: number = REQUEST_TIMEOUT_DEFAULT
  ): Promise<Cash> {
    return await new Promise((resolve, reject) => {
      const stanzaElement = builder.tree(),
        stanzaType = stanzaElement.getAttribute("type") || null,
        stanzaID = stanzaElement.getAttribute("id") || null;

      // Ensure that builder root is an IQ packet (cannot request using non-IQ \
      //   stanzas)
      if (stanzaElement.tagName !== "iq") {
        throw new Error(
          `Cannot request using non-IQ stanza, got: ${stanzaElement.tagName}`
        );
      }

      // Ensure that IQ packet type is either 'get' or 'set' (can only request \
      //   using those types)
      if (stanzaType !== IQType.Get && stanzaType !== IQType.Set) {
        throw new Error(`Cannot request using IQ type: '${stanzaType}'`);
      }

      // Ensure that IQ packet holds an ID, as this is required to route the \
      //   response
      if (stanzaID === null) {
        throw new Error("Missing required IQ identifier");
      }

      // Stack pending request
      this.__pendingRequests[stanzaID] = {
        id: stanzaID,
        success: resolve,
        failure: reject,

        timeout: setTimeout(() => {
          this.__handlePendingRequest(stanzaID);
        }, timeout)
      };

      // Emit stanza
      this.emit(builder);
    });
  }

  private __onConnect(status: Strophe.Status): void {
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

        // Trigger disconnected hooks
        this.__unbindReceivers();
        this.__cancelPendingRequests();
        this.__raiseConnectLifecycle(new Error("Disconnected from server"));

        // Clear connection
        this.__clearConnection();

        // Disconnect for good? (was not connected before)
        if (this.__credentials === undefined) {
          // Clear context
          this.__clearContext();
        } else {
          logger.debug("Reconnecting in a few moments…");

          // Pause context
          this.__pauseContext();

          // Schedule reconnect
          const credentials = this.__credentials;

          this.__reconnectTimeout = setTimeout(() => {
            delete this.__reconnectTimeout;

            logger.debug("Reconnecting now…");

            // TODO: implement another way, cause it looks like a bug in \
            //   Strophe.js is triggering a flood of DISCONNECTED event on the \
            //   second reconnect attempt, and subsequent ones.
            // this.__connect(
            //   CONFIG.hosts.websocket,
            //   credentials.jid,
            //   credentials.password
            // );
          }, RECONNECT_INTERVAL);
        }

        break;
      }

      // [CONNECTED] The connection has succeeded
      case Strophe.Status.CONNECTED: {
        logger.info("Connected");

        // Setup context
        this.__setupContext();

        // Trigger connected hooks
        this.__bindReceivers();
        this.__raiseConnectLifecycle();
        this.__setupConnection();

        break;
      }

      // [AUTHFAIL] The authentication attempt failed
      case Strophe.Status.AUTHFAIL: {
        logger.error("Authentication failure");

        // Trigger connection failure hooks
        this.__raiseConnectLifecycle(new Error("Failed to authenticate"));

        // Clean connection
        this.__clearConnection();

        break;
      }

      // [CONNFAIL] The connection attempt failed
      case Strophe.Status.CONNFAIL: {
        logger.error("Connection failure");

        // Trigger connection failure hooks
        this.__raiseConnectLifecycle(new Error("Failed to connect"));

        // Clean connection
        this.__clearConnection();

        break;
      }

      // [CONNTIMEOUT] The connection has timed out
      case Strophe.Status.CONNTIMEOUT: {
        logger.error("Connection timed out");

        // Trigger connection failure hooks
        this.__raiseConnectLifecycle(new Error("Connection timed out"));

        // Clean connection
        this.__clearConnection();

        break;
      }
    }
  }

  private __onInput(data: string): void {
    logger.debug("(in)", data);
  }

  private __onOutput(data: string): void {
    logger.debug("(out)", data);
  }

  private __raiseConnectLifecycle(error?: Error): void {
    if (this.__connectLifecycle) {
      if (error) {
        this.__connectLifecycle.failure(error);
      } else {
        this.__connectLifecycle.success();
      }

      delete this.__connectLifecycle;
    }
  }

  private __setupConnection(): void {
    // Send initial presence
    Broker.$connection.sendPresence();
  }

  private __clearConnection(): void {
    // Cancel timers (that may re-create a connection)
    this.__cancelScheduledReconnectTimer();

    // Disconnect and void the connection
    if (this.__connection) {
      this.__connection.disconnect("closed");

      this.__connection = undefined;
    }
  }

  private __setupContext(): void {
    this.jid = this.__connection ? jid(this.__connection.jid) : undefined;

    Store.$session.setConnected(true);
  }

  private __pauseContext(): void {
    // Mark as disconnected (this might be temporary)
    Store.$session.setConnected(false);
  }

  private __clearContext(): void {
    // Mark as disconnected (this is permanent)
    Store.$session.setConnected(false);

    // Unassign JID
    this.jid = undefined;

    // Void stored credentials
    this.__credentials = undefined;
  }

  private async __connect(
    relayHost: string,
    jid: JID,
    password: string
  ): Promise<void> {
    // Create connection
    this.__connection = new Strophe.Connection(relayHost, {
      protocol: "wss"
    });

    // Bind handlers
    this.__connection.rawInput = this.__onInput.bind(this);
    this.__connection.rawOutput = this.__onOutput.bind(this);

    await new Promise((resolve, reject) => {
      // Assign lifecycle handlers
      this.__connectLifecycle = {
        success: resolve,
        failure: reject
      };

      // Connect to server
      this.__connection?.connect(
        jid.toString(),
        password,
        this.__onConnect.bind(this)
      );
    }).catch(error => {
      throw error;
    });
  }

  private __bindReceivers(): void {
    // Not already bound? Bind all receivers
    if (this.__boundReceivers.length === 0) {
      ["presence", "message", "iq"].forEach(handlerName => {
        // Generate handler function
        const handlerFn = (stanza: Element) => {
          logger.log(`(${handlerName})`, stanza);

          // Acquire registered handler (if any)
          const stanzaID = stanza.getAttribute("id") || "";

          // Pass to pending request handler (if any)
          if (this.__handlePendingRequest(stanzaID, stanza) !== true) {
            // Pass to specific ingestor instead
            this.__ingestors[handlerName as keyof BrokerEvent](stanza);
          }

          // Important: keep handler alive (otherwise it will get torn out \
          //   after it gets fired once)
          return true;
        };

        // Append handler
        this.__boundReceivers.push(
          this.__connection?.addHandler(
            handlerFn,
            "",
            handlerName
          ) as StropheHandler
        );
      });
    }
  }

  private __unbindReceivers(): void {
    // Anything bound? Unbind all receivers
    if (this.__boundReceivers.length > 0) {
      // Unbind all receivers
      while (this.__boundReceivers.length > 0) {
        this.__connection?.deleteHandler(this.__boundReceivers.pop());
      }
    }
  }

  private __handlePendingRequest(id: string, stanza?: Element): boolean {
    // Acquire pending request
    const request = id ? this.__pendingRequests[id] : undefined;

    if (request) {
      // Unstack pending request from register
      clearTimeout(request.timeout);

      delete this.__pendingRequests[request.id];

      if (
        stanza?.tagName === "iq" &&
        (stanza?.getAttribute("type") as IQType) === IQType.Result
      ) {
        logger.info(
          `Pending request #${id} to: '${
            stanza.getAttribute("from") || ""
          }' response received`
        );

        // Pass to success handler
        request.success($(stanza));
      } else if (stanza) {
        const errorText =
          stanza.querySelector("error text")?.textContent || "Failed";

        logger.warn(
          `Pending request #${id} to: '${
            stanza.getAttribute("from") || ""
          }' received error reply:`,
          errorText
        );

        // Pass to error handler (got stanza response)
        request.failure(new Error(errorText));
      } else {
        logger.warn(
          `Pending request #${id} has been cancelled (it may have timed out)`
        );

        // Pass to error handler (no response received)
        request.failure(new Error("Cancelled"));
      }

      // A pending request was handled
      return true;
    }

    // No pending request found
    return false;
  }

  private __cancelPendingRequests(): void {
    // Cancel all pending requests
    for (const id in this.__pendingRequests) {
      this.__handlePendingRequest(id);
    }
  }

  private __cancelScheduledReconnectTimer(): void {
    if (this.__reconnectTimeout !== undefined) {
      clearTimeout(this.__reconnectTimeout);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerClient;
