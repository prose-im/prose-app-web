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
      show = (stanza.attr("show") as PresenceShow) || null,
      status = stanza.attr("status") || null,
      priority = parseInt(stanza.attr("priority") || "0");

    if (from !== null) {
      const fromJID = jid(from);

      // TODO: (separately) implement support for 'probe' presences

      // TODO: store each presence on JID + resource
      // TODO: provide a store method to get highest-priority presence
      // TODO: when reconnected, invalidate all store presences

      console.error("==> presence : " + from, type);
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
