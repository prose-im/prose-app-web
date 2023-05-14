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
import { jid, JID } from "@xmpp/jid";
import xmppID from "@xmpp/id";
import xmppTime from "@xmpp/time";

// PROJECT: BROKER
import BrokerEventIngestor from "@/broker/events/ingestor";
import { MessageChatState } from "@/broker/stanzas/message";
import {
  NS_CHAT_STATES,
  NS_REACTIONS,
  NS_FASTEN,
  NS_CARBONS,
  NS_MAM,
  NS_PUBSUB_EVENT,
  NS_AVATAR_METADATA
} from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

// PROJECT: STORES
import Store from "@/store";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerEventMessage extends BrokerEventIngestor {
  protected _handlers = {
    any: this.__any,
    [NS_CHAT_STATES]: this.__chatState,
    [NS_REACTIONS]: this.__reactions,
    [NS_FASTEN]: this.__fasten,
    [NS_CARBONS]: this.__carbons,
    [NS_MAM]: this.__mam,
    [NS_PUBSUB_EVENT]: this.__pubsubEvent
  };

  private __any(stanza: Cash): void {
    // Pass to generic message handler
    this.__handleMessage(stanza);
  }

  private __chatState(stanza: Cash, element: Cash): void {
    // XEP-0085: Chat State Notifications
    // https://xmpp.org/extensions/xep-0085.html

    const from = stanza.attr("from") || null,
      chatstate = (element.prop("tagName") as MessageChatState) || null;

    if (from !== null && chatstate !== null) {
      Store.$inbox.setStatesChatstate(jid(from), chatstate);
    }
  }

  private __reactions(stanza: Cash, element: Cash): void {
    // XEP-0444: Message Reactions
    // https://xmpp.org/extensions/xep-0444.html
    // TODO
  }

  private __fasten(stanza: Cash, element: Cash): void {
    // XEP-0422: Message Fastening
    // https://xmpp.org/extensions/xep-0422.html

    const from = stanza.attr("from") || null,
      id = element.attr("id") || null;

    if (from !== null && id !== null) {
      const fromJID = jid(from).bare();

      // Check if should retract message?
      if (element.has("retract").length > 0) {
        this.__handleFastenRetract(fromJID, id);
      }
    }
  }

  private __carbons(stanza: Cash, element: Cash): void {
    // XEP-0280: Message Carbons
    // https://xmpp.org/extensions/xep-0280.html
    // TODO
  }

  private __mam(stanza: Cash, element: Cash): void {
    // XEP-0313: Message Archive Management
    // https://xmpp.org/extensions/xep-0313.html

    element.children("forwarded").each((_, forwardedNode: Element) => {
      const forwarded = $(forwardedNode);

      // Acquire message child
      const message = forwarded.find("message").first();

      if (message.length > 0) {
        // Read delayed delivery information
        const delay = forwarded.find("delay").first();

        // Read archive identifier
        const archiveId = element.attr("id") || undefined;

        // Pass to generic message handler
        this.__handleMessage(
          message,
          delay.length > 0 ? delay : undefined,
          archiveId
        );
      }
    });
  }

  private __pubsubEvent(stanza: Cash, element: Cash): void {
    // XEP-0060: Publish-Subscribe
    // https://xmpp.org/extensions/xep-0060.html

    const from = stanza.attr("from") || null;

    if (from !== null) {
      const fromJID = jid(from);

      element.children("items").each((_, itemsNode: Element) => {
        const items = $(itemsNode),
          node = items.attr("node");

        switch (node) {
          case NS_AVATAR_METADATA: {
            // Pass to avatar metadata handler
            this.__handlePubsubEventAvatarMetadata(fromJID, items);

            break;
          }

          default: {
            logger.debug(
              `Ignoring unhandled pubsub event from: '${fromJID}' with ` +
                `node: '${node}'`
            );
          }
        }
      });
    }
  }

  private __handleMessage(
    message: Cash,
    delay?: Cash,
    archiveId?: string
  ): void {
    const from = message.attr("from") || null,
      to = message.attr("to") || null,
      bodyElement = message.find("body").first();

    // Check if message should be ignored
    // Conditions:
    //  - Retraction message
    const shouldIgnore = message.has("retract").length > 0 ? true : false;

    // Handle message with body?
    if (
      from !== null &&
      to !== null &&
      bodyElement.length > 0 &&
      shouldIgnore !== true
    ) {
      logger.info(`Processing message from: '${from || "?"}'`);

      // Read body text
      const fromJID = jid(from).bare(),
        toJID = jid(to).bare(),
        bodyText = bodyElement.text();

      // Acquire store target JID
      const storeJID =
        this._client.jid?.bare().equals(fromJID) === true ? toJID : fromJID;

      // Read date and time
      const dateTime =
        (delay ? delay.attr("stamp") : null) || xmppTime.datetime();

      // Insert message in store
      // TODO: handle different message types
      Store.$inbox.insertMessage(storeJID, {
        id: message.attr("id") || xmppID(),
        archiveId: archiveId,
        type: "text",
        date: dateTime,
        from: fromJID.toString(),
        content: bodyText
      });
    }
  }

  private __handleFastenRetract(fromJID: JID, messageId: string): void {
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

  private __handlePubsubEventAvatarMetadata(fromJID: JID, items: Cash): void {
    const itemElement = items.find("item").first(),
      metadataElement = itemElement.find("metadata").first();

    if (metadataElement.length > 0) {
      // Acquire item identifier
      const itemID = itemElement.attr("id") || null;

      if (itemID === null) {
        // Remove avatar metadata from store
        Store.$avatar.updateMetadata(fromJID, null);
      } else {
        const infoElement = metadataElement.find("info").first();

        // Acquire metadata information (required attributes)
        const identifier = infoElement.attr("id") || null,
          type = infoElement.attr("type") || null,
          bytesString = infoElement.attr("bytes") || null;

        if (
          itemID === identifier &&
          identifier !== null &&
          type !== null &&
          bytesString !== null
        ) {
          // Acquire more metadata information (optional attributes)
          const heightString = infoElement.attr("height") || undefined,
            widthString = infoElement.attr("width") || undefined;

          // Convert data into numbers
          const bytes = parseInt(bytesString),
            height = heightString ? parseInt(heightString) : undefined,
            width = widthString ? parseInt(widthString) : undefined;

          // Update avatar metadata in store
          Store.$avatar.updateMetadata(fromJID, itemID, {
            type,
            bytes,
            height,
            width
          });
        } else {
          logger.warn(
            `Dropping incomplete or invalid avatar metadata from: ` +
              `'${fromJID}' with ID: '${itemID}'`
          );
        }
      }
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventMessage;
