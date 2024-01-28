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

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleChannel extends BrokerModule {
  async loadPublicChannels(): Promise<Array<Channel>> {
    logger.info("Will load public channels (or reload)");

    return (await this._client.client?.loadPublicChannels()) || [];
  }

  async findPublicChannelByName(name: string): Promise<JID | undefined> {
    logger.info(`Will find public channel by name: '${name}'`);

    return this._client.client?.findPublicChannelByName(name);
  }

  async createPublicChannel(name: string): Promise<JID | undefined> {
    logger.info(`Will create public channel: '${name}'`);

    return await this._client.client?.createPublicChannel(name);
  }

  async createPrivateChannel(name: string): Promise<JID | undefined> {
    logger.info(`Will create private channel: '${name}'`);

    return this._client.client?.createPrivateChannel(name);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleChannel;
