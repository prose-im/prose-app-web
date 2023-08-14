/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import Store from "@/store";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMAM extends BrokerModule {
  async loadLatestMessages(conversation: JID) {
    try {
      const messages = await this._client.client?.loadLatestMessages(
        conversation,
        undefined,
        true
      );

      if (messages !== undefined) {
        Store.$inbox.insertMessages(conversation, messages);
      }
    } catch (err) {
      logger.error("Failed to load messages from MAM:", err);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMAM;
