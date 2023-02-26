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
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import Broker from "@/broker";
import BrokerEvent from "@/broker/events";
import { IQType } from "@/broker/stanzas/iq";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface ConnectLifecycle {
  success: (value: void) => void;
  failure: (error: Error) => void;
}

interface PendingRequest {
  id: string;
  success: (stanza: Element) => void;
  failure: (error: Error) => void;
  timeout: number;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const REQUEST_TIMEOUT_DEFAULT = 10000; // 10 seconds

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerClient {
  private readonly __ingestors: BrokerEvent;

  private __connection: Strophe.Connection;
  private __connectLifecycle?: ConnectLifecycle;
  private __boundReceivers: Array<Strophe.Handler> = [];
  private __pendingRequests: { [id: string]: PendingRequest } = {};

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
      this.__connection.connect(
        jid.toString(),
        password,
        this.__onConnect.bind(this)
      );
    }).catch(error => {
      throw error;
    });
  }

  emit(builder: Strophe.Builder) {
    // Emit stanza on the wire? (if connected)
    if (this.__connection && this.__connection.connected === true) {
      this.__connection.send(builder.tree());
    } else {
      throw new Error("Client is disconnected");
    }
  }

  async request(
    builder: Strophe.Builder,
    timeout: number = REQUEST_TIMEOUT_DEFAULT
  ): Promise<Element | void> {
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
      case Strophe.Status.CONNECTING: {
        logger.debug("Connecting...");

        break;
      }

      case Strophe.Status.DISCONNECTING: {
        logger.debug("Disconnecting...");

        break;
      }

      case Strophe.Status.DISCONNECTED: {
        logger.warn("Disconnected");

        // Trigger disconnected hooks
        this.__unbindReceivers();
        this.__cancelAllPendingRequests();
        this.__raiseConnectLifecycle(new Error("Disconnected from server"));

        break;
      }

      case Strophe.Status.CONNECTED: {
        logger.info("Connected");

        // Trigger connected hooks
        this.__bindReceivers();
        this.__raiseConnectLifecycle();
        this.__setupConnection();

        break;
      }

      case Strophe.Status.CONNFAIL: {
        logger.error("Connection failure");

        // Trigger connection failure hooks
        this.__raiseConnectLifecycle(new Error("Failed to authenticate"));

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
    // TODO: this should not be done here, some kind of event bus w/ a hook is \
    //   cleaner than that. This is a temporary solution.
    Broker.$connection.sendInitialPresence();

    // Load roster
    // TODO: do not do this here!!
    Broker.$roster
      .loadRoster()
      .then((roster: Element) => {
        // TODO
        console.error("==> got roster = ", roster);
      })
      .catch((error: Error) => {
        // TODO
        console.error("==> error loading roster = ", error);
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
          const hadPendingRequest = this.__handlePendingRequest(
            stanzaID,
            stanza
          );

          // Pass to specific ingestor?
          if (hadPendingRequest !== true) {
            this.__ingestors[handlerName](stanza);
          }

          // Important: keep handler alive (otherwise it will get torn out \
          //   after it gets fired once)
          return true;
        };

        // Append handler
        this.__boundReceivers.push(
          this.__connection.addHandler(handlerFn, null, handlerName)
        );
      });
    }
  }

  private __unbindReceivers(): void {
    // Anything bound? Unbind all receivers
    if (this.__boundReceivers.length === 0) {
      // Unbind all receivers
      while (this.__boundReceivers.length > 0) {
        this.__connection.deleteHandler(this.__boundReceivers.pop());
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
        request.success(stanza);
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

      return true;
    }

    return false;
  }

  private __cancelAllPendingRequests(): void {
    // Cancel all pending requests
    for (const id in this.__pendingRequests) {
      this.__handlePendingRequest(id);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerClient;
