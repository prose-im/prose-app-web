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

import BrokerModuleAccount from "@/broker/modules/account";
import BrokerModuleRoom from "@/broker/modules/room";
import BrokerModulePresence from "@/broker/modules/presence";
import BrokerModuleChannel from "@/broker/modules/channel";
import BrokerModuleProfile from "@/broker/modules/profile";
import BrokerModuleRoster from "@/broker/modules/roster";
import BrokerModuleStatus from "@/broker/modules/status";
import BrokerModuleData from "@/broker/modules/data";

/**************************************************************************
 * CLASS
 * ************************************************************************* */

class Broker {
  readonly client: BrokerClient;

  readonly $account: BrokerModuleAccount;
  readonly $profile: BrokerModuleProfile;
  readonly $roster: BrokerModuleRoster;
  readonly $status: BrokerModuleStatus;
  readonly $presence: BrokerModulePresence;
  readonly $room: BrokerModuleRoom;
  readonly $channel: BrokerModuleChannel;
  readonly $data: BrokerModuleData;

  constructor() {
    // Initialize client
    this.client = new BrokerClient();

    // Bootstrap all modules (for client)
    this.$account = new BrokerModuleAccount(this.client);
    this.$profile = new BrokerModuleProfile(this.client);
    this.$roster = new BrokerModuleRoster(this.client);
    this.$status = new BrokerModuleStatus(this.client);
    this.$presence = new BrokerModulePresence(this.client);
    this.$room = new BrokerModuleRoom(this.client);
    this.$channel = new BrokerModuleChannel(this.client);
    this.$data = new BrokerModuleData(this.client);
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default new Broker();
