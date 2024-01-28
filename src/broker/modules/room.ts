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

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleRoom extends BrokerModule {
  async startObservingRooms(): Promise<void> {
    await this._client.client?.startObservingRooms();
  }

  async sidebarItems(): Promise<SidebarItem[]> {
    return (await this._client.client?.sidebarItems()) || [];
  }

  async join(jid: JID): Promise<JID | undefined> {
    return this._client.client?.joinRoom(jid);
  }

  async destroy(jid: JID): Promise<void> {
    return this._client.client?.destroyRoom(jid);
  }

  async startConversation(participants: Array<JID>): Promise<JID | undefined> {
    return this._client.client?.startConversation(
      participants.map(jid => jid.toString())
    );
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleRoom;
