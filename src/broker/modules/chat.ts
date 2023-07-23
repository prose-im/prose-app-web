/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { $msg, $iq } from "strophe.js";
import xmppID from "@xmpp/id";
import xmppTime from "@xmpp/time";
import { BareJID, JID } from "@prose-im/prose-core-client-wasm";

// PROJECT: STORES
import Store from "@/store";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import BrokerBuilderReactions from "@/broker/builders/reactions";
import {
  MessageID,
  MessageChatState,
  MessageReaction,
  MessageType
} from "@/broker/stanzas/message";
import { IQType } from "@/broker/stanzas/iq";
import {
  NS_MESSAGE_CORRECT,
  NS_MESSAGE_RETRACT,
  NS_CHAT_STATES,
  NS_FASTEN,
  NS_FALLBACK,
  NS_REACTIONS,
  NS_HINTS,
  NS_CARBONS
} from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

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
  async sendMessage(to: JID, body: string): void {
    if (!this._client.client) {
      return;
    }
    await this._client.client.sendMessage(to, body);
  }

  updateMessage(
    to: BareJID,
    body: string,
    ids: { original: MessageID; replacement?: MessageID }
  ): void {
    // XEP-0308: Last Message Correction
    // https://xmpp.org/extensions/xep-0308.html

    this._client.emit(
      $msg({ id: ids.replacement || xmppID(), to: to.toString() })
        .c("body")
        .t(body)
        .up()
        .c("replace", { xmlns: NS_MESSAGE_CORRECT, id: ids.original })
    );

    logger.info(
      `Updated message #${ids.original} sent to: '${to}' with new body:`,
      body
    );
  }

  retractMessage(id: MessageID, to: BareJID): void {
    // XEP-0424: Message Retraction
    // https://xmpp.org/extensions/xep-0424.html

    this._client.emit(
      $msg({ id: xmppID(), to: to.toString(), type: MessageType.Chat })
        .c("body")
        .t(RETRACT_MESSAGE_BODY)
        .up()
        .c("apply-to", { xmlns: NS_FASTEN, id: id })
        .c("retract", { xmlns: NS_MESSAGE_RETRACT })
        .up()
        .up()
        .c("fallback", { xmlns: NS_FALLBACK })
        .up()
        .c("store", { xmlns: NS_HINTS })
    );

    logger.info(`Retracted message #${id} sent to: '${to}'`);
  }

  sendChatState(to: JID, state: MessageChatState): void {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html

    this._client.emit(
      $msg({ id: xmppID(), to: to.toString(), type: MessageType.Chat }).c(
        state,
        {
          xmlns: NS_CHAT_STATES
        }
      )
    );

    logger.info(`Sent ${state} chat state to: '${to}'`);
  }

  async sendReactions(id: MessageID, to: JID, reactions: Set<MessageReaction>) {
    // XEP-0444: Message Reactions
    // https://xmpp.org/extensions/xep-0444.html
    if (!this._client.client) {
      return;
    }

    for (const reaction of reactions) {
      await this._client.client.toggleReactionToMessage(
        to.bare(),
        id,
        reaction
      );
    }
  }

  async setMessageCarbonsEnabled(enabled: boolean): Promise<void> {
    // XEP-0280: Message Carbons
    // https://xmpp.org/extensions/xep-0280.html

    const state = enabled === true ? "enable" : "disable";

    logger.info(`Will toggle message carbons to state: ${state}`);

    await this._client.request(
      $iq({ type: IQType.Set, id: xmppID() }).c(state, {
        xmlns: NS_CARBONS
      })
    );
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMessage;
