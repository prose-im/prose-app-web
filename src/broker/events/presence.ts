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
import { jid } from "@xmpp/jid";

// PROJECT: BROKER
import BrokerEventIngestor from "@/broker/events/ingestor";
import { PresenceType, PresenceShow } from "@/broker/stanzas/presence";
import { NS_CAPS } from "@/broker/stanzas/xmlns";

// PROJECT: STORES
import Store from "@/store";

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
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#presence

    logger.info(`Processing presence from: '${stanza.attr("from")}'`);

    const from = stanza.attr("from") || null,
      type = (stanza.attr("type") as PresenceType) || null,
      show = (stanza.find("show").text() as PresenceShow) || null,
      status = stanza.find("status").text() || null,
      priority = parseInt(stanza.find("priority").text() || "0");

    if (from !== null) {
      // TODO: (separately) implement support for 'probe' presences
      Store.$presence.update(jid(from), {
        priority,
        type,
        show: show || undefined,
        status: status || undefined
      });
    }
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
