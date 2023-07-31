/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { UserActivity, Availability } from "@prose-im/prose-core-client-wasm";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: STORES
import Store from "@/store";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleStatus extends BrokerModule {
  async setAvailability(availability: Availability): Promise<void> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#presence
    await this._client.client?.setAvailability(availability);
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
