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

/**************************************************************************
 * CLASS
 * ************************************************************************* */

abstract class BrokerModule {
  private readonly __client: BrokerClient;

  constructor(client: BrokerClient) {
    this.__client = client;
  }
}

/**************************************************************************
 * EXPORTS
 * ************************************************************************* */

export default BrokerModule;
