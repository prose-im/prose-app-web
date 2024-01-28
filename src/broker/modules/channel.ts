/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Channel, JID } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleChannel extends BrokerModule {
  async loadPublicChannels(): Promise<Array<Channel>> {
    return (await this._client.client?.loadPublicChannels()) || [];
  }

  async findPublicChannelByName(name: string): Promise<JID | undefined> {
    return this._client.client?.findPublicChannelByName(name);
  }

  async createPublicChannel(name: string): Promise<JID | undefined> {
    return this._client.client?.createPublicChannel(name);
  }

  async createPrivateChannel(name: string): Promise<JID | undefined> {
    return this._client.client?.createPrivateChannel(name);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleChannel;
