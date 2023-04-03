/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { jid } from "@xmpp/jid";
import xmppID from "@xmpp/id";
import xmppTime from "@xmpp/time";

// PROJECT: BROKER
import BrokerEventIngestor from "@/broker/events/ingestor";
import { MessageChatState } from "@/broker/stanzas/message";
import {
  NS_CHAT_STATES,
  NS_REACTIONS,
  NS_FASTEN,
  NS_CARBONS,
  NS_MAM
} from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: STORES
import Store from "@/store";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventMessage extends BrokerEventIngestor {
  protected _handlers = {
    any: this.__any,
    [NS_CHAT_STATES]: this.__chatState,
    [NS_REACTIONS]: this.__reactions,
    [NS_FASTEN]: this.__fasten,
    [NS_CARBONS]: this.__carbons,
    [NS_MAM]: this.__mam
  };

  private __any(stanza: Element): void {
    // Pass to generic message handler
    this.__handleMessage(stanza);
  }

  private __chatState(stanza: Element, element?: Element): void {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html
    const from = stanza.getAttribute("from") || null,
      chatstate = (element?.tagName as MessageChatState) || null;

    if (from !== null && chatstate !== null) {
      Store.$inbox.setStatesChatstate(jid(from), chatstate);
    }
  }

  private __reactions(stanza: Element, element?: Element): void {
    // XEP-0444: Message Reactions
    // https://xmpp.org/extensions/xep-0444.html
    // TODO
  }

  private __fasten(stanza: Element, element?: Element): void {
    // XEP-0422: Message Fastening
    // https://xmpp.org/extensions/xep-0422.html
    // TODO
  }

  private __carbons(stanza: Element, element?: Element): void {
    // XEP-0280: Message Carbons
    // https://xmpp.org/extensions/xep-0280.html
    // TODO
  }

  private __mam(stanza: Element, element?: Element): void {
    // XEP-0313: Message Archive Management
    // https://xmpp.org/extensions/xep-0313.html
    // TODO
    console.error("==> mam received!", element);

    if (element !== undefined) {
      Strophe.forEachChild(element, "forwarded", (forwarded: Element) => {
        const message =
          (forwarded.getElementsByTagName("message") || [])[0] || null;

        if (message !== null) {
          // Read delayed delivery information
          const delay =
            (forwarded.getElementsByTagName("delay") || [])[0] || undefined;

          // Pass to generic message handler
          this.__handleMessage(message, delay);
        }
      });
    }
  }

  private __handleMessage(message: Element, delay?: Element): void {
    const from = message.getAttribute("from") || null,
      bodyElement = (message.getElementsByTagName("body") || [])[0] || null;

    // Handle message with body?
    if (from !== null && bodyElement !== null) {
      logger.info(`Processing message from: '${from || "?"}'`);

      // Read body text
      const fromJID = jid(from).bare(),
        bodyText = bodyElement.textContent || "";

      // Read date and time
      const dateTime =
        (delay ? delay.getAttribute("stamp") : null) || xmppTime.datetime();

      // Insert message in store
      // TODO: handle different message types
      Store.$inbox.insertMessage(fromJID, {
        id: message.id || xmppID(),
        type: "text",
        date: dateTime,
        from: fromJID.toString(),
        content: bodyText
      });
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventMessage;
