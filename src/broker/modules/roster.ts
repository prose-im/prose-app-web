/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Contact, Room } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleRoster extends BrokerModule {
  async startObservingRooms(): Promise<void> {
    await this._client.client?.startObservingRooms();
  }

  async loadContacts(): Promise<Contact[]> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-syntax-actions-get

    logger.info("Will load roster (or reload)");

    return (await this._client.client?.loadContacts()) || [];
  }

  async loadConnectedRooms(): Promise<Room[]> {
    return (await this._client.client?.loadConnectedRooms()) || [];
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleRoster;
