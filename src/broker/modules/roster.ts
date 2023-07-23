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
import { BareJID, Contact } from "@prose-im/prose-core-client-wasm";
import xmppID from "@xmpp/id";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType, IQRosterSubscription, IQRosterAsk } from "@/broker/stanzas/iq";
import { NS_ROSTER } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * ENUMERATIONS
 * ************************************************************************* */

enum RosterItemGroup {
  // Favorites.
  Favorite = "favorite",
  // Team members.
  Team = "team",
  // Other contacts.
  Other = "other"
}

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface LoadRosterResponse {
  items: Array<Contact>;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const GROUP_NAME_FAVORITES = "Favorites";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleRoster extends BrokerModule {
  async loadRoster(): Promise<LoadRosterResponse> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-syntax-actions-get
    logger.info("Will load roster");

    if (!this._client.client) {
      return Promise.reject("No client");
    }

    return {
      items: await this._client.client.loadContacts()
    };
  }

  private __respondLoadRoster(response: Cash): LoadRosterResponse {
    const responseData: LoadRosterResponse = {
      items: []
    };

    // List allowed roster item groups
    response.find("query item").each((_, itemNode: Element) => {
      const itemElement = $(itemNode),
        elementJID = itemElement.attr("jid") || null;

      if (elementJID !== null) {
        const groupElement = itemElement.find("group").first();

        // Acquire item JID
        const itemJID = new BareJID(elementJID);

        // Acquire group name
        let groupName;

        if (groupElement.text() === GROUP_NAME_FAVORITES) {
          // Roster group name is set to 'favorite': consider as favorite
          groupName = RosterItemGroup.Favorite;
        } else if (itemJID.domain === this._client.jid?.domain) {
          // Item JID is using the same domain as ours: consider as team
          groupName = RosterItemGroup.Team;
        } else {
          // Otherwise: consider as other
          groupName = RosterItemGroup.Other;
        }

        // Append roster item
        responseData.items.push({
          jid: itemJID,
          group: groupName,
          subscription:
            (itemElement.attr("subscription") as IQRosterSubscription) ||
            IQRosterSubscription.None,
          ask: (itemElement.attr("ask") as IQRosterAsk) || undefined,
          name: itemElement.attr("name") || undefined
        });
      }
    });

    return responseData;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { RosterItemGroup };
export default BrokerModuleRoster;
