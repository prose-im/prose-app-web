/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Contact } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

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
 * CLASS
 * ************************************************************************* */

class BrokerModuleRoster extends BrokerModule {
  async loadContacts(): Promise<Contact[]> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-syntax-actions-get
    logger.info("Will load roster");

    if (!this._client.client) {
      return Promise.reject("No client available");
    }

    return await this._client.client.loadContacts();
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export { RosterItemGroup };
export default BrokerModuleRoster;
