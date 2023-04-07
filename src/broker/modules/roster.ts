/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { default as $, Cash } from "cash-dom";
import { $iq } from "strophe.js";
import { jid, JID } from "@xmpp/jid";
import xmppID from "@xmpp/id";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import { NS_ROSTER } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface LoadRosterResponse {
  items: Array<LoadRosterResponseItem>;
}

interface LoadRosterResponseItem {
  jid: JID;
}

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleRoster extends BrokerModule {
  async loadRoster(): Promise<LoadRosterResponse> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-syntax-actions-get
    logger.info("Will load roster");

    const response = await this._client.request(
      $iq({ type: IQType.Get, id: xmppID() }).c("query", { xmlns: NS_ROSTER })
    );

    return this.__respondLoadRoster(response);
  }

  private __respondLoadRoster(response: Cash): LoadRosterResponse {
    const responseData: LoadRosterResponse = {
      items: []
    };

    response.find("query item").each((_, itemElement) => {
      const elementJID = $(itemElement).attr("jid") || null;

      if (elementJID !== null) {
        responseData.items.push({
          jid: jid(elementJID)
        });
      }
    });

    return responseData;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleRoster;
