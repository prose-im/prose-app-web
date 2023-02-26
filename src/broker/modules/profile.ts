/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { $iq } from "strophe.js";
import xmppID from "@xmpp/id";
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import { NS_VCARD4 } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleProfile extends BrokerModule {
  async loadVCard(jid: JID): Promise<Element> {
    // XEP-0292: vCard4 Over XMPP
    // https://xmpp.org/extensions/xep-0292.html
    logger.info(`Will load vCard profile for: '${jid}'`);

    return this._client.request(
      $iq({ type: IQType.Get, id: xmppID() }).c("vcard", { xmlns: NS_VCARD4 })
    );
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleProfile;
