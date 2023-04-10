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

  private __any(stanza: Cash): void {
    // Pass to generic message handler
    this.__handleMessage(stanza);
  }

  private __chatState(stanza: Cash, element: Cash): void {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html
    const from = stanza.attr("from") || null,
      chatstate = (element.prop("tagName") as MessageChatState) || null;

    if (from !== null && chatstate !== null) {
      Store.$inbox.setStatesChatstate(jid(from), chatstate);
    }
  }

  private __reactions(stanza: Cash, element: Cash): void {
    // XEP-0444: Message Reactions
    // https://xmpp.org/extensions/xep-0444.html
    // TODO
  }

  private __fasten(stanza: Cash, element: Cash): void {
    // XEP-0422: Message Fastening
    // https://xmpp.org/extensions/xep-0422.html
    // TODO
  }

  private __carbons(stanza: Cash, element: Cash): void {
    // XEP-0280: Message Carbons
    // https://xmpp.org/extensions/xep-0280.html
    // TODO
  }

  private __mam(stanza: Cash, element: Cash): void {
    // XEP-0313: Message Archive Management
    // https://xmpp.org/extensions/xep-0313.html
    element.children("forwarded").each((_, forwardedNode: Element) => {
      const forwarded = $(forwardedNode);

      // Acquire message child
      const message = forwarded.find("message").first();

      if (message.length > 0) {
        // Read delayed delivery information
        const delay = forwarded.find("delay").first();

        // Pass to generic message handler
        this.__handleMessage(message, delay.length > 0 ? delay : undefined);
      }
    });
  }

  private __handleMessage(message: Cash, delay?: Cash): void {
    const from = message.attr("from") || null,
      to = message.attr("to") || null,
      bodyElement = message.find("body").first();

    // Handle message with body?
    if (from !== null && to !== null && bodyElement.length > 0) {
      logger.info(`Processing message from: '${from || "?"}'`);

      // Read body text
      const fromJID = jid(from).bare(),
        toJID = jid(to).bare(),
        bodyText = bodyElement.text();

      // Acquire store target JID
      const storeJID =
        this._client.jid?.bare().equals(fromJID) === true ? toJID : fromJID;

      // Read date and time
      const dateTime =
        (delay ? delay.attr("stamp") : null) || xmppTime.datetime();

      // Insert message in store
      // TODO: handle different message types
      Store.$inbox.insertMessage(storeJID, {
        id: message.attr("id") || xmppID(),
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
