/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { Cash } from "cash-dom";
import { $iq } from "strophe.js";
import xmppID from "@xmpp/id";
import { BareJID, jidToString } from "@prose-im/prose-core-client-wasm";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import { MessageID } from "@/broker/stanzas/message";
import { NS_MAM, NS_RSM, NS_DATA } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";
import Store from "@/store";
import message from "@/broker/events/message";

/**************************************************************************
 * INTERFACES
 * ************************************************************************* */

interface LoadMessagesResponse {
  complete: boolean;
  rsm?: LoadMessagesResponseRSM;
}

interface LoadMessagesResponseRSM {
  count: number;
  first?: string;
  last?: string;
}

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const HISTORY_PAGE_SIZE = 40;

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMAM extends BrokerModule {
  async loadLatestMessages(conversation: BareJID) {
    if (!this._client.client) {
      return;
    }

    const messages = await this._client.client.loadLatestMessages(
      conversation,
      undefined,
      true
    );

    for (const message of messages) {
      Store.$inbox.insertMessages(conversation, messages)
    }
  }

  async loadMessages(
    jid: BareJID,
    {
      beforeId,
      afterId,
      ids
    }: {
      beforeId?: MessageID;
      afterId?: MessageID;
      ids?: Array<MessageID>;
    } = {}
  ): Promise<LoadMessagesResponse> {
    // XEP-0313: Message Archive Management
    // https://xmpp.org/extensions/xep-0313.html

    const stanza = $iq({ type: IQType.Set, id: xmppID() });

    // Append query
    {
      const stanzaQuery = stanza.c("query", { xmlns: NS_MAM });

      // Append filters to query (<x> element)
      {
        const stanzaQueryData = stanzaQuery.c("x", {
          xmlns: NS_DATA,
          type: "submit"
        });

        // Add form fields
        stanzaQueryData
          .c("field", { var: "FORM_TYPE", type: "hidden" })
          .c("value", {}, NS_MAM)
          .up();

        stanzaQueryData
          .c("field", { var: "with" })
          .c("value", {}, jid.toString())
          .up();

        // Add paging parameters (before/after)
        // Notice: they can be combined together.
        if (beforeId) {
          stanzaQueryData
            .c("field", { var: "before-id" })
            .c("value", {}, beforeId)
            .up();
        }

        if (afterId) {
          stanzaQueryData
            .c("field", { var: "after-id" })
            .c("value", {}, afterId)
            .up();
        }

        if (ids && ids.length > 0) {
          const stanzaQueryDataField = stanzaQueryData.c("field", {
            var: "ids"
          });

          ids.forEach(id => {
            stanzaQueryDataField.c("value", {}, id);
          });

          stanzaQueryDataField.up();
        }

        // Done, go back to root
        stanzaQueryData.up();
      }

      // Append RSM to query (Result Set Management — <set> element)
      // Notice: use an empty 'before' RSM element to indicate that we want to \
      //   return messages in backwards order.
      {
        stanzaQuery
          .c("set", { xmlns: NS_RSM })
          .c("max", {}, HISTORY_PAGE_SIZE.toString())
          .c("before", {}, "")
          .up();
      }
    }

    logger.info(
      `Will load messages from history from: '${jid}' before: ` +
        `#${beforeId || "--"}, after: #${afterId || "--"}`
    );

    // Send request
    const response = await this._client.request(stanza);

    return this.__respondLoadMessages(response);
  }

  private __respondLoadMessages(response: Cash): LoadMessagesResponse {
    // Parse request response
    const finElement = response.find("fin").first();

    const responseData: LoadMessagesResponse = {
      complete: finElement.attr("complete") === "true" ? true : false
    };

    // Append RSM information? (if any)
    const rsmElement = finElement.find("set").first();

    if (rsmElement.length > 0) {
      responseData.rsm = {
        count: parseInt(rsmElement.find("count").text() || "0") as number,
        first: rsmElement.find("first").text(),
        last: rsmElement.find("last").text()
      };
    }

    return responseData;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export type { LoadMessagesResponse };
export default BrokerModuleMAM;
