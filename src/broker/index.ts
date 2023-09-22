/*
 * This file is part of prose-app-web
 *
 * Copyright 2023, Prose Foundation
 */

/**************************************************************************
 * IMPORTS
 * ************************************************************************* */

// PROJECT: BROKER
import BrokerClient from "@/broker/client";

import BrokerModuleProfile from "@/broker/modules/profile";
import BrokerModuleRoster from "@/broker/modules/roster";
import BrokerModuleStatus from "@/broker/modules/status";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class Broker {
  readonly client: BrokerClient;

  readonly $profile: BrokerModuleProfile;
  readonly $roster: BrokerModuleRoster;
  readonly $status: BrokerModuleStatus;

  constructor() {
    // Initialize client
    this.client = new BrokerClient();

    // Bootstrap all modules (for client)
    this.$profile = new BrokerModuleProfile(this.client);
    this.$roster = new BrokerModuleRoster(this.client);
    this.$status = new BrokerModuleStatus(this.client);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Broker();
