/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { $msg } from "strophe.js";
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import {
  MessageID,
  MessageChatState,
  MessageReaction,
  MessageType
} from "@/broker/stanzas/message";
import {
  NS_MESSAGE_CORRECT,
  NS_MESSAGE_RETRACT,
  NS_CHAT_STATES,
  NS_FASTEN,
  NS_FALLBACK
} from "@/broker/stanzas/xmlns";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const RETRACT_MESSAGE_BODY =
  "This person attempted to retract a previous message, but it's unsupported " +
  "by your client.";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMessage extends BrokerModule {
  sendMessage(to: JID, body: string): void {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html
    this.__client.emit(
      $msg({ to: to.toString(), type: MessageType.Chat }).c("body").t(body)
    );
  }

  updateMessage(
    to: JID,
    body: string,
    messageIds: { original: MessageID; replacement: MessageID }
  ): void {
    // XEP-0308: Last Message Correction
    // https://xmpp.org/extensions/xep-0308.html
    this.__client.emit(
      $msg({ id: messageIds.replacement, to: to.toString() })
        .c("body")
        .t(body)
        .up()
        .c("replace", { xmlns: NS_MESSAGE_CORRECT, id: messageIds.original })
    );
  }

  retractMessage(messageId: MessageID, to: JID): void {
    // XEP-0424: Message Retraction
    // https://xmpp.org/extensions/xep-0424.html
    this.__client.emit(
      $msg({ to: to.toString(), type: MessageType.Chat })
        .c("body")
        .t(RETRACT_MESSAGE_BODY)
        .up()
        .c("apply-to", { xmlns: NS_FASTEN, id: messageId })
        .c("retract", { xmlns: NS_MESSAGE_RETRACT })
        .up()
        .up()
        .c("fallback", { xmlns: NS_FALLBACK })
        .up()
        .c("store", { xmlns: NS_HINTS })
    );
  }

  sendChatState(to: JID, state: MessageChatState): void {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html
    this.__client.emit(
      $msg({ to: to.toString(), type: MessageType.Chat }).c(state, {
        xmlns: NS_CHAT_STATES
      })
    );
  }

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
