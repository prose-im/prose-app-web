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
    // XEP-0313: Message Archive Management
    // https://xmpp.org/extensions/xep-0313.html

    try {
      const messages = await this._client.client?.loadLatestMessages(
        conversation,
        undefined,
        true
      );

      if (messages !== undefined) {
        Store.$inbox.insertMessages(conversation, messages);
      }
    } catch (error) {
      logger.error("Failed to load messages from MAM:", error);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMAM;
