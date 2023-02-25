/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: BROKER
import BrokerEventIngestor from "@/broker/events/ingestor";
import {
  NS_CHAT_STATES,
  NS_REACTIONS,
  NS_FASTEN,
  NS_CARBONS,
  NS_MAM
} from "@/broker/stanzas/xmlns";

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
    // TODO
    console.error("==> event : message : received any", stanza);
  }

  private __chatState(stanza: Element, element: Element): void {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html

    // TODO
    console.error("==> event : message : got chat state", element);
  }

  private __reactions(stanza: Element, element: Element): void {
    // XEP-0444: Message Reactions
    // https://xmpp.org/extensions/xep-0444.html

    // TODO
    console.error("==> event : message : got reactions", element);
  }

  private __fasten(stanza: Element, element: Element): void {
    // XEP-0422: Message Fastening
    // https://xmpp.org/extensions/xep-0422.html

    // TODO
    console.error("==> event : message : got fasten", element);
  }

  private __carbons(stanza: Element, element: Element): void {
    // XEP-0280: Message Carbons
    // https://xmpp.org/extensions/xep-0280.html

    // TODO
    console.error("==> event : message : got carbon", element);
  }

  private __mam(stanza: Element, element: Element): void {
    // XEP-0313: Message Archive Management
    // https://xmpp.org/extensions/xep-0313.html

    // TODO
    console.error("==> event : message : got mam", element);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventMessage;
