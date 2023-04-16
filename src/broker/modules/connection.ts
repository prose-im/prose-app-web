/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { $pres } from "strophe.js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import BrokerBuilderCaps from "@/broker/builders/caps";
import { IQType } from "@/broker/stanzas/iq";
import { NS_PING, NS_CAPS } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleConnection extends BrokerModule {
  sendInitialPresence(): void {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#presence
    const stanza = $pres();

    // Append entity capabilities
    const capsAttributes = BrokerBuilderCaps.attributes();

    stanza.c("c", {
      xmlns: NS_CAPS,
      hash: capsAttributes.hash,
      node: capsAttributes.node,
      ver: capsAttributes.verification
    });

    this._client.emit(stanza);

    logger.info("Sent initial presence to server");
  }

  sendPing(): void {
    // XEP-0199: XMPP Ping
    // https://xmpp.org/extensions/xep-0199.html
    this._client.emit($iq({ type: IQType.Get }).c("ping", { xmlns: NS_PING }));

    logger.info("Sent ping to server");
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleConnection;
