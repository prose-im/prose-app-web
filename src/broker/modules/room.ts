/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, SidebarItem } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleRoom extends BrokerModule {
  async startObservingRooms(): Promise<void> {
    logger.info("Will start observing rooms");

    await this._client.client?.startObservingRooms();
  }

  async sidebarItems(): Promise<SidebarItem[]> {
    logger.info("Will acquire sidebar items");

    return (await this._client.client?.sidebarItems()) || [];
  }

  async join(jid: JID): Promise<JID | undefined> {
    logger.info(`Will join room: '${jid}'`);

    return this._client.client?.joinRoom(jid);
  }

  async destroy(jid: JID): Promise<void> {
    logger.info(`Will destroy room: '${jid}'`);

    return this._client.client?.destroyRoom(jid);
  }

  async startConversation(participants: Array<JID>): Promise<JID | undefined> {
    logger.info(
      `Will start conversation with ${participants.length} participants`
    );

    return this._client.client?.startConversation(
      participants.map(jid => jid.toString())
    );
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleRoom;
