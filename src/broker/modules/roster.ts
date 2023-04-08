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
  items: Array<LoadRosterResponseItem>;
}

interface LoadRosterResponseItem {
  jid: JID;
  group: RosterItemGroup;
  name?: string;
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

    // List allowed roster item groups
    const allowedRosterItemGroups = Object.values(RosterItemGroup);

    response.find("query item").each((_, itemNode) => {
      const itemElement = $(itemNode),
        elementJID = itemElement.attr("jid") || null,
        elementName = itemElement.attr("name") || null;

      if (elementJID !== null) {
        const groupElement = itemElement.find("group").first();

        // Parse group name
        const groupName = groupElement.text() as RosterItemGroup;

        // Append roster item
        responseData.items.push({
          jid: jid(elementJID),
          group: allowedRosterItemGroups.includes(groupName)
            ? groupName
            : RosterItemGroup.Other,
          name: elementName || undefined
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
