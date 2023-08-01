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
import { MessageID, MessageReaction } from "@/broker/stanzas/message";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMessage extends BrokerModule {
  async sendMessage(to: JID, body: string): Promise<void> {
    await this._client.client?.sendMessage(to, body);
  }

  async updateMessage(
    to: JID,
    body: string,
    messageID: MessageID
  ): Promise<void> {
    await this._client.client?.updateMessage(to, messageID, body);
  }

  async retractMessage(id: MessageID, to: JID): Promise<void> {
    await this._client.client?.retractMessage(to, id);
    logger.info(`Retracted message #${id} sent to: '${to}'`);
  }

  async setUserIsComposing(
    conversation: JID,
    isComposing: boolean
  ): Promise<void> {
    await this._client.client?.setUserIsComposing(conversation, isComposing);
  }

  async sendReactions(id: MessageID, to: JID, reactions: Set<MessageReaction>) {
    if (!this._client.client) {
      return;
    }

    for (const reaction of reactions) {
      await this._client.client.toggleReactionToMessage(to, id, reaction);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMessage;
