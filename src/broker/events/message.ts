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
    const from = stanza.getAttribute("from") || null,
      bodyElement = (stanza.getElementsByTagName("body") || [])[0] || null;

    if (from !== null && bodyElement !== null) {
      logger.info(`Processing message from: '${from || "?"}'`);

      // Read body text
      const fromJID = jid(from).bare(),
        bodyText = bodyElement.textContent || "";

      // TODO
      console.error("==> stanza", stanza);

      // Insert message in store
      // TODO: read delayed delivery date, if any
      Store.$inbox.insertMessage(fromJID, {
        id: stanza.id || xmppID(),
        type: "text",
        date: xmppTime.datetime(),
        from: fromJID.toString(),
        content: bodyText
      });
    } else {
      logger.warn(
        "Cannot process message, as it does not have any 'from' or 'body' set"
      );
    }
  }

  private __chatState(stanza: Element, element?: Element): void {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html
    // TODO
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
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventMessage;
