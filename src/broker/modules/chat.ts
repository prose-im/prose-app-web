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
import logger from "@/utilities/logger";

/**************************************************************************
 * TYPES
 * ************************************************************************* */

export type MessageID = string;
export type MessageReaction = string;

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMessage extends BrokerModule {
  async sendMessage(to: JID, body: string): Promise<void> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#message

    await this._client.client?.sendMessage(to, body);
  }

  async updateMessage(
    to: JID,
    body: string,
    messageID: MessageID
  ): Promise<void> {
    // XEP-0308: Last Message Correction
    // https://xmpp.org/extensions/xep-0308.html

    await this._client.client?.updateMessage(to, messageID, body);
  }

  async retractMessage(id: MessageID, to: JID): Promise<void> {
    // XEP-0424: Message Retraction
    // https://xmpp.org/extensions/xep-0424.html

    await this._client.client?.retractMessage(to, id);

    logger.info(`Retracted message #${id} sent to: '${to}'`);
  }

  async sendChatState(conversation: JID, composing: boolean): Promise<void> {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html

    await this._client.client?.setUserIsComposing(conversation, composing);
  }

  async sendReactions(id: MessageID, to: JID, reactions: Set<MessageReaction>) {
    // XEP-0444: Message Reactions
    // https://xmpp.org/extensions/xep-0444.html

    for (const reaction of reactions) {
      await this._client.client?.toggleReactionToMessage(to, id, reaction);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMessage;
