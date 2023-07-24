/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { $pres } from "strophe.js";
import xmppID from "@xmpp/id";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import BrokerBuilderCaps from "@/broker/builders/caps";
import { PresenceShow } from "@/broker/stanzas/presence";
import { NS_CAPS, NS_ACTIVITY, NS_PUBSUB } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CONSTANTS
 * ************************************************************************* */

const PRIORITY_DEFAULT = 1;

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleStatus extends BrokerModule {
  sendPresence(show?: PresenceShow): void {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#presence
    const stanza = $pres();

    // Append presence priority
    stanza.c("priority", {}, `${PRIORITY_DEFAULT}`);

    // Append presence show? (if any)
    if (show !== undefined) {
      stanza.c("show", {}, show);
    }

    // Append entity capabilities
    {
      const capsAttributes = BrokerBuilderCaps.attributes();

      stanza.c("c", {
        xmlns: NS_CAPS,
        hash: capsAttributes.hash,
        node: capsAttributes.node,
        ver: capsAttributes.verification
      });

      // Done, go back to root
      stanza.up();
    }

    this._client.emit(stanza);

    logger.info("Sent presence to server");
  }

  async sendActivity(icon: string, text?: string): Promise<void> {
    // XEP-0108: User Activity
    // https://xmpp.org/extensions/xep-0108.html

    // Make activity stanza
    const stanza = $iq({ type: IQType.Set, id: xmppID() });

    // Append activity PEP node
    {
      const stanzaActivity = stanza
        .c("pubsub", { xmlns: NS_PUBSUB })
        .c("publish", { node: NS_ACTIVITY })
        .c("item")
        .c("activity", { xmlns: NS_ACTIVITY });

      // Add icon
      // Notice: as we are using emoji-based icons in order to specify the \
      //   kind of activity, we do not map to a proper RPID there, but rather \
      //   use the 'undefined' unspecified activity general category, and the \
      //   'other' specific instance, with a text value for the icon. Given \
      //   that the specification is far too limiting in terms of available \
      //   activity categories, we prefer to rely on more modern, emoji-based, \
      //   activities.
      {
        stanzaActivity.c("undefined").c("other", {}, icon).up();
      }

      // Add text? (if any)
      if (text) {
        stanzaActivity.c("text", {}, text);
      }
    }

    logger.info(`Will send activity with icon: ${icon}`);

    // Publish user activity to PEP node
    await this._client.request(stanza);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleStatus;
