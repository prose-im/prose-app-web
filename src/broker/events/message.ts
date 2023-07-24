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

  private __pubsubEvent(stanza: Cash, element: Cash): void {
    // XEP-0060: Publish-Subscribe
    // https://xmpp.org/extensions/xep-0060.html

    const from = stanza.attr("from") || null;

    if (from !== null) {
      const fromJID = new BareJID(from);

      element.children("items").each((_, itemsNode: Element) => {
        const items = $(itemsNode),
          node = items.attr("node");

        switch (node) {
          case NS_AVATAR_METADATA: {
            // Pass to avatar metadata handler
            this.__handlePubsubEventAvatarMetadata(fromJID, items);

            break;
          }

          case NS_ACTIVITY: {
            // Pass to activity handler
            this.__handlePubsubEventActivity(fromJID, items);

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

  private __handlePubsubEventAvatarMetadata(fromJID: BareJID, items: Cash): void {
    // XEP-0084: User Avatar
    // https://xmpp.org/extensions/xep-0084.html

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

  private __handlePubsubEventActivity(fromJID: JID, items: Cash): void {
    // XEP-0108: User Activity
    // https://xmpp.org/extensions/xep-0108.html

    const itemElement = items.find("item").first(),
      activityElement = itemElement.find("activity").first();

    if (activityElement.length > 0) {
      // Acquire item identifier
      const itemID = itemElement.attr("id") || null;

      // Acquire icon and optional text
      // Notice: Prose only supports unknown activities mapping to an emoji \
      //   icon, with an optional text. Full RPID support is not offered \
      //   within the UI (and not intended to be in the future).
      const icon = activityElement.find("undefined other").text() || null,
        text = activityElement.find("text").text() || null;

      if (itemID !== null && icon !== null) {
        // Update activity in store
        Store.$activity.setActivity(fromJID, itemID, {
          icon,
          text: text || undefined
        });
      } else {
        // Clear activity in store
        Store.$activity.setActivity(fromJID, null);

        logger.warn(
          `Dropping empty or icon-less user activity from: '${fromJID}', ` +
            `maybe due to RPID not being supported`
        );
      }
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerEventMessage;
