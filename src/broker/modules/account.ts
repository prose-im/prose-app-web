/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import { AccountInfo } from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModuleAccount extends BrokerModule {
  async loadAccountInfo(): Promise<AccountInfo | void> {
    logger.info("Will load account information (or reload)");

    return (await this._client.client?.loadAccountInfo()) || undefined;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModuleAccount;
