/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { JID } from "@xmpp/jid";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleMessage extends BrokerModule {
  sendMessage(to: JID, body: string): void {
    // TODO
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleMessage;
