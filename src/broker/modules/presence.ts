/*
 * This file is part of prose-app-web
 *
 * Copyright 2024, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// NPM
import {
  PresenceSubRequest,
  PresenceSubRequestId
} from "@prose-im/prose-sdk-js";

// PROJECT: BROKER
import BrokerModule from "@/broker/modules";

// PROJECT: UTILITIES
import logger from "@/utilities/logger";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class BrokerModulePresence extends BrokerModule {
  async loadSubscriptionRequests(): Promise<Array<PresenceSubRequest>> {
    logger.info("Will load presence subscription requests (or reload)");

    return (
      (await this._client.client?.loadPresenceSubscriptionRequests()) || []
    );
  }

  async approvePresenceSubscriptionRequest(
    id: PresenceSubRequestId
  ): Promise<void> {
    logger.info("Will approve presence subscription request");

    await this._client.client?.approvePresenceSubscriptionRequest(id);
  }

  async denyPresenceSubscriptionRequest(
    id: PresenceSubRequestId
  ): Promise<void> {
    logger.info("Will deny presence subscription request");

    await this._client.client?.denyPresenceSubscriptionRequest(id);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModulePresence;
