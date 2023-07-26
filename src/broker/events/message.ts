/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { default as $, Cash } from "cash-dom";
import { BareJID } from "@prose-im/prose-core-client-wasm";
import xmppID from "@xmpp/id";
import xmppTime from "@xmpp/time";

// PROJECT: BROKER
import BrokerEventIngestor from "@/broker/events/ingestor";
import { MessageChatState } from "@/broker/stanzas/message";
import { NS_AVATAR_METADATA } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: STORES
import Store from "@/store";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventMessage extends BrokerEventIngestor {
  protected _handlers = {};

  private __chatState(stanza: Cash, element: Cash): void {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html

    const from = stanza.attr("from") || null,
      chatstate = (element.prop("tagName") as MessageChatState) || null;

    if (from !== null && chatstate !== null) {
      Store.$inbox.setStatesChatstate(new BareJID(from), chatstate);
    }
  }

  private __handleFastenRetract(fromJID: BareJID, messageId: string): void {
    // XEP-0424: Message Retraction
    // https://xmpp.org/extensions/xep-0424.html

    // Retract message from store
    const wasRemoved = Store.$inbox.retractMessage(fromJID, messageId);

    if (wasRemoved === true) {
      logger.info(`Removed message #${messageId} from: '${fromJID || "?"}'`);
    } else {
      logger.warn(
        `Did not remove message #${messageId} from: '${fromJID || "?"}', ` +
          `as it does not exist in store (at this point in time?)`
      );
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventMessage;
