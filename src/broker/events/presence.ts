/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Cash } from "cash-dom";

// PROJECT: BROKER
import BrokerEventIngestor from "@/broker/events/ingestor";
import { NS_CAPS } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventPresence extends BrokerEventIngestor {
  protected _handlers = {
    any: this.__any,
    [NS_CAPS]: this.__caps
  };

  private __any(stanza: Cash): void {
    logger.info(`Processing presence from: '${stanza.attr("from")}'`);

    // TODO
    console.error("==> stanza", stanza[0]);
  }

  private __caps(stanza: Cash, element: Cash): void {
    // XEP-0115: Entity Capabilities
    // https://xmpp.org/extensions/xep-0115.html
    // TODO
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventPresence;
