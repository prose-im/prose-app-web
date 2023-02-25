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
import { NS_CHAT_STATES } from "@/broker/stanzas/xmlns";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventMessage extends BrokerEventIngestor {
  protected _handlers = {
    root: this.__root,
    [NS_CHAT_STATES]: this.__chatState
  };

  private __root(stanza: Element): void {
    // TODO
    console.error("==> event : message : received root", stanza);
  }

  private __chatState(stanza: Element, element: Element): void {
    // TODO
    console.error("==> event : message : got chat state!", element);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventMessage;
