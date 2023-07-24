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
import { UserActivity } from "@prose-im/prose-core-client-wasm";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import BrokerBuilderCaps from "@/broker/builders/caps";
import { PresenceShow } from "@/broker/stanzas/presence";
import { NS_CAPS } from "@/broker/stanzas/xmlns";

// PROJECT: STORES
import Store from "@/store";

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

  async sendActivity(icon?: string, text?: string): Promise<void> {
    // XEP-0108: User Activity
    // https://xmpp.org/extensions/xep-0108.html
    if (!this._client.client) {
      return;
    }

    await this._client.client.sendActivity(icon, text);

    if (this._client.jid) {
      let activity: UserActivity | undefined;
      if (icon && text) {
        activity = new UserActivity(icon, text);
      }
      // TODO: We should load our own status from the store as another
      // session might change it.
      Store.$activity.setActivity(this._client.jid.toJID(), activity);
    }
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleStatus;
