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
import {
  ProseClient,
  ProseClientDelegate,
  ConnectionError,
  Availability,
  JID
} from "@prose-im/prose-core-client-wasm";

// PROJECT: BROKER
import BrokerEvent from "@/broker/events";
import { IQType } from "@/broker/stanzas/iq";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: COMMONS
import CONFIG from "@/commons/config";
import { MessageChatState } from "./stanzas/message";

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

// Notice: Strophe types do not define the 'connected' property
interface ConnectionWithConnected extends Strophe.Connection {
  connected: boolean;
}

// Notice: Strophe types do not define the 'options' property
interface ConnectionWithOptions extends Strophe.Connection {
  options: {
    protocol: string;
  };
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const REQUEST_TIMEOUT_DEFAULT = 10000; // 10 seconds

const RECONNECT_INTERVAL = 5000; // 5 seconds

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerClient implements ProseClientDelegate {
  jid?: JID;

  private readonly __ingestors: BrokerEvent;
  client?: ProseClient;

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
    // Incomplete parameters?
    if (!password) {
      throw new Error("Please provide a password");
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

    const client = await ProseClient.init(this);
    this.client = client;

    try {
      await client.connect(jid, password, Availability.Available);
    } catch (error) {
      console.log("Something went wrong", error);
      this.__clearContext();
      return;
    }

    // Setup context
    this.__setupContext();
  }

  reconnect(afterDelay = 0): void {
    const credentials = this.__credentials;

    if (credentials === undefined) {
      throw new Error("Cannot reconnect: credentials are not set");
    }
    if (this.__connection !== undefined) {
      throw new Error("Cannot reconnect: connection is active");
    }

    // Cancel any scheduled reconnect timeout
    this.__cancelScheduledReconnectTimer();

    // Schedule reconnect
    this.__reconnectTimeout = setTimeout(() => {
      delete this.__reconnectTimeout;

      logger.debug("Reconnecting now…");

      this.__connect(credentials.jid, credentials.password);
    }, afterDelay);
  }

  async logout(): Promise<void> {
    await this.client?.disconnect();
    await this.client?.deleteCachedData();
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

  clientConnected() {
    console.log("Client connected");
  }

  clientDisconnected(error?: ConnectionError) {
    console.log("Client disconnected");
  }

  async composingUsersChanged(conversation: JID) {
    console.log("Composing users changed");
    let composingUsers =
      (await this.client?.loadComposingUsersInConversation(conversation)) || [];
    Store.$inbox.setComposing(
      conversation,
      composingUsers.find(jid => jid.equals(conversation))
    );
  }

  contactChanged(jid: JID) {
    Store.$roster.emitContactChanged(jid);
  }

  avatarChanged(jid: JID): void {
    Store.$avatar.load(jid);
  }

  async messagesAppended(conversation: JID, messageIDs: string[]) {
    let messages =
      (await this.client?.loadMessagesWithIDs(conversation, messageIDs)) || [];
    Store.$inbox.insertMessages(conversation, messages);
  }

  messagesDeleted(conversation: JID, messageIDs: string[]) {
    for (const messageID of messageIDs) {
      Store.$inbox.retractMessage(conversation, messageID);
    }
  }

  async messagesUpdated(conversation: JID, messageIDs: string[]) {
    const messages =
      (await this.client?.loadMessagesWithIDs(conversation, messageIDs)) || [];
    for (const message of messages) {
      Store.$inbox.updateMessage(conversation, message.id, message);
    }
  }

  private __onConnect(status: Strophe.Status): void {
    switch (status) {
      // [CONNECTING] The connection is currently being made
      case Strophe.Status.CONNECTING: {
        logger.debug("Connecting…");

        // Resume context
        this.__resumeContext();

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
        // Important: do not disconnect in this case (as we are already \
        //   disconnected, this could create a disconnection loop in certain \
        //   cases)
        this.__clearConnection(false);

        // Disconnect for good? (was not connected before)
        if (this.__credentials === undefined) {
          // Clear context
          this.__clearContext();
        } else {
          // Pause context
          this.__pauseContext();

          // Schedule reconnect
          this.reconnect(RECONNECT_INTERVAL);
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

  private __clearConnection(disconnect = true): void {
    // Cancel timers (that may re-create a connection)
    this.__cancelScheduledReconnectTimer();

    // Disconnect and void the connection? (as needed)
    if (this.__connection) {
      if (disconnect === true) {
        this.__connection.disconnect("closed");
      }

      this.__connection = undefined;
    }
  }

  private __setupContext(): void {
    this.jid = this.__credentials?.jid;

    Store.$session.setConnected(true);
    Store.$session.setConnecting(false);

    Store.$session.setProtocol(
      (
        this.__connection as ConnectionWithOptions
      )?.options.protocol.toUpperCase()
    );
  }

  private __resumeContext(): void {
    // Mark as connecting
    Store.$session.setConnecting(true);
  }

  private __pauseContext(): void {
    // Mark as disconnected (this might be temporary)
    Store.$session.setConnected(false);
    Store.$session.setConnecting(false);
  }

  private __clearContext(): void {
    // Mark as disconnected (this is permanent)
    Store.$session.setConnected(false);
    Store.$session.setConnecting(false);
    Store.$session.setProtocol("");

    // Unassign JID
    this.jid = undefined;

    // Void stored credentials
    this.__credentials = undefined;
  }

  private async __connect(jid: JID, password: string): Promise<void> {
    // Acquire relay host
    const relayHost = CONFIG.hosts.websocket || null;

    if (!relayHost) {
      throw new Error("No relay host to connect to");
    }

    // Create connection
    this.__connection = new Strophe.Connection(relayHost, {
      protocol: "wss"
    });

    // Configure connection
    this.__connection.maxRetries = 0;

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
