/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { BareJID } from "@prose-im/prose-core-client-wasm";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import Store from "@/store";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMAM extends BrokerModule {
  async loadLatestMessages(conversation: BareJID) {
    if (!this._client.client) {
      return;
    }

    try {
      const messages = await this._client.client.loadLatestMessages(
        conversation,
        undefined,
        true
      );

      Store.$inbox.insertMessages(conversation, messages);
    } catch (err) {
      console.error("Failed to load messages.", err);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMAM;
