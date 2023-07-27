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

import BrokerModuleChat from "@/broker/modules/chat";
import BrokerModuleMAM from "@/broker/modules/mam";
import BrokerModuleProfile from "@/broker/modules/profile";
import BrokerModuleRoster from "@/broker/modules/roster";
import BrokerModuleStatus from "@/broker/modules/status";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class Broker {
  readonly client: BrokerClient;

  readonly $chat: BrokerModuleChat;
  readonly $mam: BrokerModuleMAM;
  readonly $profile: BrokerModuleProfile;
  readonly $roster: BrokerModuleRoster;
  readonly $status: BrokerModuleStatus;

  constructor() {
    // Initialize client
    this.client = new BrokerClient();

    // Bootstrap all modules (for client)
    this.$chat = new BrokerModuleChat(this.client);
    this.$mam = new BrokerModuleMAM(this.client);
    this.$profile = new BrokerModuleProfile(this.client);
    this.$roster = new BrokerModuleRoster(this.client);
    this.$status = new BrokerModuleStatus(this.client);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Broker();
