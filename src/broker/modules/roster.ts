/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID, Contact, UserBasicInfo } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleRoster extends BrokerModule {
  async loadContacts(): Promise<Contact[]> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-syntax-actions-get

    logger.info("Will load roster (or reload)");

    return (await this._client.client?.loadContacts()) || [];
  }

  async addContact(jid: JID): Promise<void> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-add

    logger.info(`Will add contact to roster: '${jid}'`);

    await this._client.client?.addContact(jid);
  }

  async removeContact(jid: JID): Promise<void> {
    // XMPP: Instant Messaging and Presence
    // https://xmpp.org/rfcs/rfc6121.html#roster-delete

    logger.info(`Will remove contact from roster: '${jid}'`);

    await this._client.client?.removeContact(jid);
  }

  async loadBlockList(): Promise<UserBasicInfo[]> {
    // XEP-0191: Blocking Command
    // https://xmpp.org/extensions/xep-0191.html

    logger.info("Will load block list (or reload)");

    return (await this._client.client?.loadBlockList()) || [];
  }

  async blockUser(jid: JID): Promise<void> {
    // XEP-0191: Blocking Command
    // https://xmpp.org/extensions/xep-0191.html

    logger.info(`Will block user: '${jid}'`);

    await this._client.client?.blockUser(jid);
  }

  async unblockUser(jid: JID): Promise<void> {
    // XEP-0191: Blocking Command
    // https://xmpp.org/extensions/xep-0191.html

    logger.info(`Will unblock user: '${jid}'`);

    await this._client.client?.unblockUser(jid);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleRoster;
