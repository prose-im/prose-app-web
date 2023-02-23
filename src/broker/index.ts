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
 * TYPES
 * ************************************************************************* */

interface BrokerModules {
  chat: BrokerModuleChat;
  connection: BrokerModuleConnection;
  mam: BrokerModuleMAM;
  profile: BrokerModuleProfile;
  roster: BrokerModuleRoster;
}

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class Broker {
  client: BrokerClient;
  modules: BrokerModules;

  constructor() {
    // Initialize client
    this.client = new BrokerClient();

    // Bootstrap all modules (for client)
    this.modules = {
      chat: new BrokerModuleChat(this.client),
      connection: new BrokerModuleConnection(this.client),
      mam: new BrokerModuleMAM(this.client),
      profile: new BrokerModuleProfile(this.client),
      roster: new BrokerModuleRoster(this.client)
    };
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Broker();
