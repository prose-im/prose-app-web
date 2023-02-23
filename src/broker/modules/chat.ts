/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import {
  MessageID,
  MessageChatState,
  MessageReaction
} from "@/broker/stanza/message";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMessage extends BrokerModule {
  sendMessage(to: JID, body: string): void {
    // TODO
  }

  updateMessage(messageId: MessageID, to: JID, body: string): void {
    // TODO
  }

  retractMessage(messageId: MessageID, to: JID): void {
    // TODO
  }

  // TODO: define a chat state
  sendChatState(to: JID, chatState: MessageChatState): void {
    // TODO
  }

  // TODO: define a reaction
  sendReactions(to: JID, reactions: Array<MessageReaction>): void {
    // TODO
  }

  setMessageCarbonsEnabled(enabled: boolean): void {
    // TODO
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMessage;
