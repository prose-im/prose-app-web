/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Channel, JID, SidebarItem } from "@prose-im/prose-sdk-js";

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

  async loadPublicChannels(): Promise<Array<Channel>> {
    return (await this._client.client?.loadPublicChannels()) || [];
  }

  async startConversation(participants: Array<JID>): Promise<void> {
    await this._client.client?.startConversation(
      participants.map(jid => jid.toString())
    );
  }

  async createPublicChannel(name: string): Promise<void> {
    await this._client.client?.createPublicChannel(name);
  }

  async createPrivateChannel(name: string): Promise<void> {
    await this._client.client?.createPrivateChannel(name);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleRoom;
