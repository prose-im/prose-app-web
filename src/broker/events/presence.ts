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
import { NS_CAPS } from "@/broker/stanzas/xmlns";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventPresence extends BrokerEventIngestor {
  protected _handlers = {
    any: this.__any,
    [NS_CAPS]: this.__caps
  };

  private __any(stanza: Element): void {
    // TODO
    console.error("==> event : presence : received any", stanza);
  }

  private __caps(stanza: Element, element: Element): void {
    // XEP-0115: Entity Capabilities
    // https://xmpp.org/extensions/xep-0115.html

    // TODO
    console.error("==> event : presence : got caps", element);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventPresence;
