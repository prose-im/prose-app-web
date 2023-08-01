import { Strophe } from "strophe.js";
import {
  ProseConnection,
  ProseConnectionProvider,
  ProseClientConfig,
  ProseConnectionEventHandler
} from "@prose-im/prose-sdk-js";

export class JSConnectionProvider implements ProseConnectionProvider {
  provideConnection(config: ProseClientConfig): ProseConnection {
    return new StropheJSConnection(config);
  }
}

export class StropheJSConnection implements ProseConnection {
  private readonly __config: ProseClientConfig;
  private readonly __connection: Strophe.Connection;
  private __eventHandler?: ProseConnectionEventHandler;

  constructor(config: ProseClientConfig) {
    this.__config = config;
    this.__connection = new Strophe.Connection(
      "wss://chat.prose.org/websocket/",
      { protocol: "wss" }
    );
    this.__connection.maxRetries = 0;
    this.__connection.rawInput = data => {
      if (this.__config.logReceivedStanzas) {
        console.info("(in)", data);
      }
      if (this.__eventHandler) {
        this.__eventHandler.handleStanza(data);
      }
    };
  }

  async connect(jid: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      this.__connection.connect(jid, password, status => {
        if (status === Strophe.Status.CONNECTING) {
          console.log("Strophe is connecting.");
        } else if (status === Strophe.Status.CONNFAIL) {
          console.log("Strophe failed to connect.");
          reject(new Error("Something went wrong."));
        } else if (status === Strophe.Status.DISCONNECTING) {
          console.log("Strophe is disconnecting.");
        } else if (status === Strophe.Status.DISCONNECTED) {
          console.log("Strophe is disconnected.");
          setTimeout(() => this.__eventHandler?.handleDisconnect());
        } else if (status === Strophe.Status.CONNECTED) {
          console.log("Strophe is connected.");
          resolve();
        }
      });
    });
  }

  disconnect() {
    this.__connection.disconnect("logout");
  }

  sendStanza(stanza: string) {
    if (this.__config.logSentStanzas) {
      console.info("(out)", stanza);
    }

    const element = new DOMParser().parseFromString(
      stanza,
      "text/xml"
    ).firstElementChild;

    if (!element) {
      throw new Error("Failed to parse stanza");
    }

    this.__connection.send(element);
  }

  setEventHandler(handler: ProseConnectionEventHandler) {
    this.__eventHandler = handler;
  }
}
