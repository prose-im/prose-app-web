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
import { IQType } from "@/broker/stanzas/iq";
import { NS_PING } from "@/broker/stanzas/xmlns";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleConnection extends BrokerModule {
  sendInitialPresence(): void {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#presence
    this.__client.emit($pres());
  }

  sendPing(): void {
    // XEP-0199: XMPP Ping
    // https://xmpp.org/extensions/xep-0199.html
    this.__client.emit($iq({ type: IQType.Get }).c("ping", { xmlns: NS_PING }));
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleConnection;
