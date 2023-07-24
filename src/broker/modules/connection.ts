/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";
import { IQType } from "@/broker/stanzas/iq";
import { NS_PING } from "@/broker/stanzas/xmlns";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleConnection extends BrokerModule {
  sendPing(): void {
    // XEP-0199: XMPP Ping
    // https://xmpp.org/extensions/xep-0199.html

    this._client.emit($iq({ type: IQType.Get }).c("ping", { xmlns: NS_PING }));

    logger.info("Sent ping to server");
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleConnection;
