/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Channel, Contact, JID, Room } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: STORES
import Store from "@/store";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMUC extends BrokerModule {
  async startObservingRooms(): Promise<void> {
    await this._client.client?.startObservingRooms();
  }

  connectedRooms(): Room[] {
    return this._client.client?.connectedRooms() || [];
  }

  async loadPublicChannels(): Promise<Channel> {
    return (await this._client.client?.loadPublicChannels()) || [];
  }

  async createGroup(participants: JID[]): Promise<void> {
    if (!this._client.client) {
      return;
    }

    const room = (await this._client.client.createGroup(
      participants.map(jid => jid.toString())
    )) as Room;

    Store.$muc.insertRoom(room);
  }

  async createPublicChannel(name: string): Promise<void> {
    if (!this._client.client) {
      return;
    }

    const room = (await this._client.client.createPublicChannel(name)) as Room;
    Store.$muc.insertRoom(room);
  }

  async createPrivateChannel(name: string): Promise<void> {
    if (!this._client.client) {
      return;
    }

    const room = (await this._client.client.createPrivateChannel(name)) as Room;
    Store.$muc.insertRoom(room);
  }

  async loadContacts(): Promise<Contact[]> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-syntax-actions-get

    logger.info("Will load roster (or reload)");

    return (await this._client.client?.loadContacts()) || [];
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMUC;
