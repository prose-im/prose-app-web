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
import BrokerModuleConnection from "@/broker/modules/connection";
import BrokerModuleMAM from "@/broker/modules/mam";
import BrokerModuleProfile from "@/broker/modules/profile";
import BrokerModuleRoster from "@/broker/modules/roster";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class Broker {
  client: BrokerClient;

  $chat: BrokerModuleChat;
  $connection: BrokerModuleConnection;
  $mam: BrokerModuleMAM;
  $profile: BrokerModuleProfile;
  $roster: BrokerModuleRoster;

  constructor() {
    // Initialize client
    this.client = new BrokerClient();

    // Bootstrap all modules (for client)
    this.$chat = new BrokerModuleChat(this.client);
    this.$connection = new BrokerModuleConnection(this.client);
    this.$mam = new BrokerModuleMAM(this.client);
    this.$profile = new BrokerModuleProfile(this.client);
    this.$roster = new BrokerModuleRoster(this.client);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Broker();
